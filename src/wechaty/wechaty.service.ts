import { Injectable, HttpService, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ImageService } from '../image/image.service';
import { sendMessage } from './bot';

import * as Moment from 'moment';

Moment.locale('zh-cn');

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
    const { stadiumId, spaceId, matchId, wxGroupId, user, unitName } = params;
    const { runDate, startAt, endAt, selectPeople, totalPeople } = matchId;

    const message = `“${
      user.nickName
    }”已报名：\n今日：⛳${startAt}-${endAt} / ${unitName}场，共报名${selectPeople}人，剩余${
      totalPeople - selectPeople
    }席\n`;

    await sendMessage(wxGroupId, message);

    const userList = await this.setUserList(matchId.id, matchId);
    const path = await this.imageService.createPicture(userList, 'bot');
    const imageUrl = `http://wx.qiuchangtong.xyz:4927${path}`;
    Logger.log(imageUrl);

    const config = {
      title: `今日 / ${startAt}-${endAt} / ${unitName}场\n...进入小程序可选择更多场次`,
      pagePath: `/client/pages/stadium/index.html?stadiumId=${stadiumId.id}&runDate=${runDate}&spaceId=${spaceId.id}&matchId=${matchId.id}`,
      thumbUrl: imageUrl,
      description: stadiumId.name,
    };

    const miniProgramPayload = {
      ...baseMiniProgramPayload,
      ...config,
    };
    Logger.log(miniProgramPayload);

    await sendMessage(wxGroupId, miniProgramPayload, true);
  }

  async autoShare(stadiumList) {
    const nowDay = Moment().format('YYYY-MM-DD');
    const nextDay = Moment().add(1, 'day').format('YYYY-MM-DD');
    const thirdDay = Moment().add(2, 'day').format('YYYY-MM-DD');

    await Promise.all(
      stadiumList.map(async (item) => {
        const wxGroupId = item[0].stadium.wxGroupId;

        console.log(
          `各位球友早上好！今天是${Moment().format(
            'MMM Do',
          )}，${Moment().format('dddd')}；天气XX，气温XX-XX℃`,
        );
        await sendMessage(
          wxGroupId,
          `各位球友早上好！今天是${Moment().format(
            'MMM Do',
          )}，${Moment().format('dddd')}；天气XX，气温XX-XX℃`,
        );
        const nowItems = item.filter((d) => d.runDate === nowDay);
        const nextItems = item.filter((d) => d.runDate === nextDay);
        const thirdItems = item.filter((d) => d.runDate === thirdDay);
        let toDayMessage = ``;
        let nowMessage = ``;
        let nextMessage = ``;
        let thirdMessage = ``;
        nowItems.forEach((d) => {
          const base = `今日:⛳${d.startAt}-${d.endAt} / ${d.unitName}场`;
          const tips = `${base}，共报名${d.selectPeople}人，剩余${
            d.totalPeople - d.selectPeople
          }席\n`;
          toDayMessage += tips;
          nowMessage = `${d.stadium.name}最近场次：\n${base}\n`;
        });

        console.log(toDayMessage);
        await sendMessage(wxGroupId, toDayMessage);

        nextItems.forEach((d) => {
          const tips = `明日:⛳${d.startAt}-${d.endAt} / ${d.unitName}场\n`;
          nextMessage += tips;
        });
        thirdItems.forEach((d) => {
          const tips = `${d.runDate.substring(5, 10)}:⛳${d.startAt}-${
            d.endAt
          } / ${d.unitName}场\n`;
          thirdMessage += tips;
        });

        console.log(nowMessage);
        console.log(nextMessage);
        console.log(thirdMessage);
        console.log(`...更多场次请进入小程序查看`);
        await sendMessage(
          wxGroupId,
          `${nowMessage}${nextMessage}${thirdMessage}...更多场次请进入小程序查看`,
        );

        await Promise.all(
          nowItems.map(async (n) => {
            const userList = await this.setUserList(n.id, n);
            const path = await this.imageService.createPicture(userList, 'bot');
            const imageUrl = `http://wx.qiuchangtong.xyz:4927${path}`;
            // const imageUrl = `http://localhost:4927${path}`;
            const config = {
              title: `今日 / ${n.startAt}-${n.endAt} / ${n.unitName}场\n...进入小程序可选择更多场次`,
              pagePath: `/client/pages/stadium/index.html?stadiumId=${n.stadium.id}&runDate=${n.runDate}&spaceId=${n.space.id}&matchId=${n.id}`,
              thumbUrl: imageUrl,
              description: n.stadium.name,
            };
            const miniProgramPayload = {
              ...baseMiniProgramPayload,
              ...config,
            };
            Logger.log(miniProgramPayload);
            await sendMessage(wxGroupId, miniProgramPayload, true);
          }),
        );
      }),
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
        // `https://wx.qiuchangtong.xyz/api/userRMatch/findAllByMatchId?matchId=${matchId}`,
        `https://wx-test.qiuchangtong.xyz/api/userRMatch/findAllByMatchId?matchId=${matchId}`,
      ),
    );
    return res.data?.data || [];
  }
}
