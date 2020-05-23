# -*- coding: utf-8 -*-
##
import numpy  as np
import pandas as pd
import os,sys
from datetime import datetime,timedelta

########################################################
## GFSファイルからSDPリスト地点の気象量を抽出してCSV保存する
########################################################
## コマンドライン引数: SDPリスト
print("argv:",sys.argv)

SDP_PATH = "./info/sdp_list.csv"
CSV_PATH = "./graph/%05d.csv"
OUT_PATH = "./layer/sdp_layer.csv"

########################################################
## タイムスタンプ処理: 3h間隔へ丸める
NOW = datetime.now()
JST1 = datetime(NOW.year,NOW.month,NOW.day,3*int(NOW.hour/3),0)
JST2 = datetime(NOW.year,NOW.month,NOW.day,3*int(NOW.hour/3),0) + timedelta(hours=24)

## 天気アイコンの定義
ICON = { "快":"./tenki/hare.png", "晴":"./tenki/hare_kumori.png", "曇":"./tenki/kumori.png", "雨":"./tenki/kumori_ame.png", "雪":"./tenki/snow.png",}
DOW2JP = ["月","火","水","木","金","土","日"]
DAY_HR = lambda x: "%s曜%02d時"%(DOW2JP[x.dayofweek],x.hour)
ROUND1 = lambda x: "%.1f"%x
FORMAT = { "JST":DAY_HR, "気温":ROUND1, "湿度":ROUND1, "雲量":ROUND1, "日射":ROUND1, "突風":ROUND1, "視程":ROUND1,}

########################################################
## 抽出地点と気象変数の指定
ENCODE = "cp932"
SDP_LIST = pd.read_csv(SDP_PATH,index_col="SDP",encoding=ENCODE)
SDP_NEWS = pd.DataFrame(columns=["lat","lon","icon"]+["time","fuken","name","html"],index=SDP_LIST.index)

########################################################
for SDP in SDP_LIST.index:
  DF = pd.read_csv(CSV_PATH%SDP,parse_dates=[0],index_col=0,encoding=ENCODE)
  LAT = SDP_LIST.loc[SDP,"lat"]
  LON = SDP_LIST.loc[SDP,"lon"]
  NAME = SDP_LIST.loc[SDP,"NAME"]
  FUKEN = SDP_LIST.loc[SDP,"FUKEN"]
  LOCATION = SDP_LIST.loc[SDP,"LOCATION"]
  print(sys.argv[0],SDP,NAME)
  ########################################################
  ROW = DF[DF.index==JST1].values[0]
  TAB = DF[(DF.index>=JST1) & (DF.index<JST2)].reset_index()
  HTML = TAB.to_html(formatters=FORMAT,index=False).replace("\n","")
  SDP_NEWS.loc[SDP] = [LAT,LON,ICON[ROW[0]]] + [JST1,FUKEN,NAME,HTML]

## JSON保存: イマココ用
SDP_NEWS.to_csv(OUT_PATH,encoding="utf-8")

########################################################
sys.exit(0)

