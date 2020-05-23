#!/bin/sh
ln -s ../gfs_rank/info .
ln -s ../gfs_rank/graph .
ln -s ../gfs_rank/pub/tenki .
python -m http.server 8000
#google-chrome http://localhost:8000/
