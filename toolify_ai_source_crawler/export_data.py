#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import argparse
from crawler import export_data

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--db", default="data/toolify.sqlite")
    p.add_argument("--out", default="data/export")
    args = p.parse_args()
    export_data(args.db, args.out)
