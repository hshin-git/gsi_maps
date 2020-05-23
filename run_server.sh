#!/bin/sh
mkdir layer
ln -s ../gfs_rank/info .
ln -s ../gfs_rank/graph .
ln -s ../gfs_rank/pub/tenki .
python 3_sdp_to_layer.py
python -m http.server 8000
#google-chrome http://localhost:8000/
