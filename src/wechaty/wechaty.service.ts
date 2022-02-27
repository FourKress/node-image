import { Injectable, HttpService } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ImageService } from '../image/image.service';
import { sendMessage } from './bot';

@Injectable()
export class WechatyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly imageService: ImageService,
  ) {}

  async sendMiniProgram(params) {
    const { stadiumId, spaceId, matchId } = params;
    const {
      selectPeople,
      minPeople,
      totalPeople,
      runDate,
      startAt,
      endAt,
    } = matchId;

    const count = selectPeople >= minPeople ? totalPeople : minPeople;
    const memberList: any = await this.getMemberList(matchId.id);
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

    const path = await this.imageService.createPicture(userList, 'bot');
    const imageUrl = `https://wx.qiuchangtong.xyz:4927${path}`;

    const config = {
      title: `${stadiumId.name}/${spaceId.name}/${runDate.substring(
        5,
        10,
      )} ${startAt}-${endAt}`,
      pagePath: `/client/pages/stadium/index.html?stadiumId=${stadiumId.id}&runDate=${runDate}&spaceId=${spaceId.id}&matchId=${matchId.id}`,
      thumbUrl: imageUrl,
    };

    const miniProgramPayload = {
      appid: 'wx8e63001d0409fa13',
      username: 'gh_aeefc035b7a3@app',
      description: '求队-为了我们的热爱!',
      iconUrl: 'https://wx.qiuchangtong.xyz/images/logo.jpg',
      ...config,
    };

    await sendMessage('20817106223@chatroom', miniProgramPayload, true);

    console.log(config);
  }

  async getMemberList(matchId) {
    const res = await lastValueFrom(
      this.httpService.get(
        `https://wx.qiuchangtong.xyz/api/userRMatch/findAllByMatchId?matchId=${matchId}`,
      ),
    );
    return res.data?.data || [];
  }
}
