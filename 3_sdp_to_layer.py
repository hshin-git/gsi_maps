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
GFS_PATH = "./info/gfs_rank.csv"
CSV_PATH = "./graph/%05d.csv"
OUT_PATH = "./layer/sdp_layer.csv"

########################################################
## タイムスタンプ処理: 3h間隔へ丸める
NOW = datetime.now()
JST1 = datetime(NOW.year,NOW.month,NOW.day,3*int(NOW.hour/3),0)
JST2 = datetime(NOW.year,NOW.month,NOW.day,3*int(NOW.hour/3),0) + timedelta(hours=24)

## 天気アイコンの定義
ICON = { "快":"./tenki/hare.png", "晴":"./tenki/hare_kumori.png", "曇":"./tenki/kumori.png", "雨":"./tenki/kumori_ame.png", "雪":"./tenki/snow.png",}
COLOR = { "快":"#f00", "晴":"#f00", "曇":"#000", "雨":"#00f", "雪":"#0f0",}
TENKI = lambda x: "<font color=%s><b>%s</b></font>"%(COLOR[x],x)
DOW2JP = ["月","火","水","木","金","土","日"]
DAY_HR = lambda x: "<b>%s曜%02d時</b>"%(DOW2JP[x.dayofweek],x.hour)
ROUND0 = lambda x: "%.0f"%round(x,0)
ROUND1 = lambda x: "%.1f"%round(x,1)
FORMAT = { "JST":DAY_HR, "天気":TENKI, "気温":ROUND0, "湿度":ROUND0, "雲量":ROUND0, "日射":ROUND1, "突風":ROUND0, "視程":ROUND0, "暑さ":ROUND0, }

########################################################
## 抽出地点と気象変数の指定
ENCODE = "cp932"
SDP_LIST = pd.read_csv(SDP_PATH,index_col="SDP",encoding=ENCODE)
SDP_NEWS = pd.DataFrame(columns=["lat","lon","icon","html"],index=SDP_LIST.index)
#GFS_RANK = pd.read_csv(GFS_PATH,parse_dates=['DATE'],index_col=0,encoding=ENCODE)

########################################################
for SDP in SDP_LIST.index:
  DF = pd.read_csv(CSV_PATH%SDP,parse_dates=[0],index_col=0,encoding=ENCODE)
  LAT = SDP_LIST.loc[SDP,"lat"]
  LON = SDP_LIST.loc[SDP,"lon"]
  NAME = SDP_LIST.loc[SDP,"NAME"]
  FUKEN = SDP_LIST.loc[SDP,"FUKEN"]
  #LOCATION = SDP_LIST.loc[SDP,"LOCATION"]
  DF["雲量"] = DF["雲量"] * 100.
  print(sys.argv[0],SDP,NAME)
  ## GFSランキング
  """
  RANK = GFS_RANK[(GFS_RANK.DATE<JST2) & (GFS_RANK.SDP==SDP)]
  TEXT = "<ul>"
  for r in RANK.index:
    v = GFS_RANK.loc[r,"GFS"]
    p = GFS_RANK.loc[r,"PERCENTILE"]
    TEXT += "<li>{0} is {1}".format(v[:-3],"large" if p>50 else "small")
  TEXT += "</ul>"
  """
  ########################################################
  ROW = DF[DF.index==JST1].values[0]
  TAB = DF[(DF.index>=JST1) & (DF.index<JST2)].reset_index()
  HTML = ""
  HTML += "<center>"
  HTML += "<b>GFS天気予報" +" "+ FUKEN +" "+ NAME + "</b><br>"
  HTML += TAB.to_html(formatters=FORMAT,index=False,escape=False).replace("\n","")
  HTML += "気温℃ 湿度% 雲量% 日射kW/㎡ 突風m/s 視程km<br>"
  #HTML += str(NOW)
  HTML += "</center>"
  SDP_NEWS.loc[SDP] = [LAT,LON,ICON[ROW[0]],HTML]

## CSV保存: Leaflet用
SDP_NEWS.to_csv(OUT_PATH,encoding="utf-8")

########################################################
sys.exit(0)
