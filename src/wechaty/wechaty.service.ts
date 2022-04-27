import { Injectable, HttpService, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ImageService } from '../image/image.service';
import { sendMessage, baseNotice } from './bot';

import * as Moment from 'moment';

Moment.locale('zh-cn');

const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const baseMiniProgramPayload = {
  appid: 'wx8e63001d0409fa13',
  username: 'gh_aeefc035b7a3@app',
  iconUrl: 'https://wx.qiuchangtong.xyz/images/logo.jpg',
};

@Injectable()
export class WechatyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly imageService: ImageService,
  ) {}

  async sendMiniProgram(params) {
    const { stadiumId, spaceId, matchId, wxGroupId } = params;
    const { runDate } = matchId;
    const message = this.getNoticeTitle(params);

    await sendMessage(wxGroupId, message);

    const userList = await this.setUserList(matchId.id, matchId);
    const path = await this.imageService.createPicture(userList, 'bot');
    const imageUrl = `http://wx.qiuchangtong.xyz:4927${path}`;
    Logger.log(imageUrl);

    const config = {
      title: this.getMiniProgramTitle(params),
      pagePath: `/client/pages/stadium/index.html?stadiumId=${stadiumId.id}&runDate=${runDate}&spaceId=${spaceId.id}&matchId=${matchId.id}`,
      thumbUrl: imageUrl,
      description: '求队',
    };

    const miniProgramPayload = {
      ...baseMiniProgramPayload,
      ...config,
    };
    Logger.log(miniProgramPayload);

    await sendMessage(wxGroupId, miniProgramPayload, true);
  }

  async autoShare(stadiumList) {
    const { weather, temperature } = await this.getWeather();
    const nowDay = Moment().format('YYYY-MM-DD');
    const nextDay = Moment().add(1, 'day').format('YYYY-MM-DD');
    const thirdDay = Moment().add(2, 'day').format('YYYY-MM-DD');

    await Promise.all(
      stadiumList.map(async (item) => {
        if (!item?.length) return;

        const wxGroupId = item[0].stadium.wxGroupId;
        const stadiumName = item[0].stadium.name;

        await sendMessage(
          wxGroupId,
          `各位球友早上好！今天是${Moment()
            .format('MMM Do')
            .replace(' ', '')}，${Moment().format(
            'dddd',
          )}；天气${weather}，气温${temperature}℃`,
        );
        const nowItems = item.filter((d) => d.runDate === nowDay);
        const nextItems = item.filter((d) => d.runDate === nextDay);
        const thirdItems = item.filter((d) => d.runDate === thirdDay);
        let toDayMessage = ``;
        let nowMessage = ``;
        let nextMessage = ``;
        let thirdMessage = ``;
        let dateStr = '';
        let sendList = [];
        nowItems.forEach((d) => {
          const base = `今日:⛳${d.startAt}-${d.endAt} / ${d.unitName}场`;
          const tips = `${base}，共报名${d.selectPeople}人，剩余${
            d.totalPeople - d.selectPeople
          }席\n`;
          toDayMessage += tips;
          nowMessage += `${base}\n`;
          dateStr = '今日';
          sendList = nowItems;
        });

        console.log(toDayMessage);
        if (toDayMessage) {
          await sendMessage(wxGroupId, toDayMessage);
        }

        nextItems.forEach((d) => {
          const tips = `明日:⛳${d.startAt}-${d.endAt} / ${d.unitName}场\n`;
          nextMessage += tips;
          if (!dateStr) {
            dateStr = '明日';
            sendList = nextItems;
          }
        });
        thirdItems.forEach((d) => {
          const tips = `${d.runDate.substring(5, 10)}:⛳${d.startAt}-${
            d.endAt
          } / ${d.unitName}场\n`;
          thirdMessage += tips;
          if (!dateStr) {
            dateStr = d.runDate.substring(5, 10);
            sendList = thirdItems;
          }
        });

        console.log(
          `${stadiumName}最近场次：\n${nowMessage}${nextMessage}${thirdMessage}...更多场次请进入小程序查看`,
        );
        if (nowMessage || nextMessage || thirdMessage) {
          await sendMessage(
            wxGroupId,
            `${stadiumName}最近场次：\n${nowMessage}${nextMessage}${thirdMessage}...更多场次请进入小程序查看`,
          );
        }

        if (sendList?.length) {
          await Promise.all(
            sendList.map(async (n) => {
              const userList = await this.setUserList(n.id, n);
              const path = await this.imageService.createPicture(
                userList,
                'bot',
              );
              const imageUrl = `http://wx.qiuchangtong.xyz:4927${path}`;
              const config = {
                title: `${dateStr} / ${n.startAt}-${n.endAt} / ${n.unitName}场\n...进入小程序可选择更多场次`,
                pagePath: `/client/pages/stadium/index.html?stadiumId=${n.stadium.id}&runDate=${n.runDate}&spaceId=${n.space.id}&matchId=${n.id}`,
                thumbUrl: imageUrl,
                description: stadiumName,
              };
              const miniProgramPayload = {
                ...baseMiniProgramPayload,
                ...config,
              };
              Logger.log(miniProgramPayload);
              await sendMessage(wxGroupId, miniProgramPayload, true);
            }),
          );
        }
      }),
    );
  }

  async appleForBoss(user) {
    const { nickName, phoneNum } = user;
    await baseNotice(
      `"${nickName}"申请成功场主，联系电话：${phoneNum}，请赶快处理。`,
    );
  }

  async withdrawNotice(user) {
    const { nickName, phoneNum, withdrawAmt, withdrawStatus } = user;
    await baseNotice(
      `"${nickName}"提现${
        withdrawStatus ? '成功' : '失败'
      }，提现金额: ${withdrawAmt}, 联系电话：${phoneNum}，请知悉。`,
    );
  }

  async refundNotice(params) {
    const { wxGroupId } = params;
    const message = this.getNoticeTitle(params, true);
    await sendMessage(wxGroupId, message);
  }

  async applyWechatyBot(stadium) {
    const {
      name,
      phoneNum,
      user: { nickName },
    } = stadium;
    await baseNotice(
      `"${nickName}"申请在"${name}"场馆启用机器人，联系电话：${phoneNum}，请赶快处理。`,
    );
  }

  async setUserList(matchId, info) {
    const count =
      info.selectPeople >= info.minPeople ? info.totalPeople : info.minPeople;
    const memberList: any = await this.getMemberList(matchId);
    const userList = Array(count)
      .fill({})
      .map((d, i) => {
        const target = memberList[i];
        const index = i + 1;
        const data = {
          index,
          isDone: false,
          isCancel: false,
        };
        if (target) {
          const { avatarUrl, nickName } = target;
          return {
            avatarUrl,
            nickName,
            ...data,
          };
        }
        return {
          ...d,
          ...data,
        };
      });

    return userList;
  }

  async getMemberList(matchId) {
    const res = await lastValueFrom(
      this.httpService.get(
        `https://wx.qiuchangtong.xyz/api/userRMatch/findAllByMatchId?matchId=${matchId}`,
      ),
    );
    return res.data?.data || [];
  }

  async getWeather() {
    const res = await lastValueFrom(
      this.httpService.get(
        'https://restapi.amap.com/v3/weather/weatherInfo?key=a3f64614ca623dbc3cb708aa2fa6765b&city=500000&extensions=base',
      ),
    );
    const data = res.data?.lives[0];
    return data;
  }

  getWeek2CN(runDate) {
    return `(${weekMap[Moment(runDate).day()]})`;
  }

  getDateStr(runDate) {
    const isNowDay = Moment().format('YYYY-MM-DD') === runDate;
    return `${isNowDay ? '今日' : runDate.substring(5, 10)}${this.getWeek2CN(
      runDate,
    )}`;
  }

  getUserAndStatus(user, isRefund = false) {
    return `"${user.nickName}"已${isRefund ? '取消' : ''}报名：\n`;
  }

  getDesc(stadium, space, match) {
    const { runDate, startAt, endAt } = match;

    return `${this.getDateStr(runDate)}:⛳${startAt}-${endAt} / ${
      space.name
    } / ${stadium.name}`;
  }

  getDateAndCount(stadium, space, match) {
    const { selectPeople, totalPeople } = match;

    return `${this.getDesc(
      stadium,
      space,
      match,
    )}，\n共报名${selectPeople}人，剩余${totalPeople - selectPeople}席`;
  }

  getNoticeTitle(params, isRefund = false) {
    const { user, spaceId, matchId, stadiumId } = params;

    return `${this.getUserAndStatus(user, isRefund)}${this.getDateAndCount(
      stadiumId,
      spaceId,
      matchId,
    )}`;
  }

  getMiniProgramTitle(params) {
    const { spaceId, matchId, stadiumId } = params;
    return this.getDesc(stadiumId, spaceId, matchId);
  }
}
