import argparse
import json
import pandas as pd


def parse_int(value, default_value=-1):
    parsed_value = default_value
    try:
        parsed_value = int(str(value).replace(",", "").replace("+", ""))
    except:
        parsed_value = default_value
    return parsed_value


def main():

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-ld",
        "--libdata",
        default="data/PLS_FY22_AE_pud22i.csv",
        help="Path to library data .csv file",
    )
    parser.add_argument(
        "-id",
        "--incomedata",
        default="data/ACSDT5Y2023.B19013-Data-Houshold-Income.csv",
        help="Path to income data .csv file",
    )
    parser.add_argument(
        "-rd",
        "--racedata",
        default="data/ACSDT5Y2023.B02001-Data-Race.csv",
        help="Path to race data .csv file",
    )
    parser.add_argument(
        "-ed",
        "--ethnicitydata",
        default="data/ACSDT5Y2023.B03003-Data-Hispanic.csv",
        help="Path to ethnicity data .csv file",
    )
    parser.add_argument(
        "-out",
        "--outputfile",
        default="public/data/2022-library-data.json",
        help="Path to ethnicity data .csv file",
    )
    parser.add_argument("-d", "--debug", action="store_true", help="Debug mode")
    args = parser.parse_args()

    # Read all the data files
    lib_df = pd.read_csv(args.libdata, encoding="latin-1")
    print(f"Found {lib_df.shape[0]:,} entries in {args.libdata}")

    income_df = pd.read_csv(args.incomedata, skiprows=[1])
    print(f"Found {income_df.shape[0]:,} entries in {args.incomedata}")

    race_df = pd.read_csv(args.racedata, skiprows=[1])
    print(f"Found {race_df.shape[0]:,} entries in {args.racedata}")

    ethnicity_df = pd.read_csv(args.ethnicitydata, skiprows=[1])
    print(f"Found {ethnicity_df.shape[0]:,} entries in {args.ethnicitydata}")

    # Parse census tract number
    lib_df["GEO_ID"] = lib_df.apply(
        lambda row: f"1400000US{str(row['CENTRACT']).zfill(11)}", axis=1
    )

    # Parse census tract description
    income_df["CENSUS_TRACT_DESCRIPTION"] = income_df.apply(
        lambda row: "{0} ({1}, {2})".format(*str(row["NAME"]).split("; ")), axis=1
    )

    # Parse income
    income_df["MEDIAN_INCOME"] = income_df.apply(
        lambda row: parse_int(row["B19013_001E"]), axis=1
    )

    # Calculate percentage race
    race_df["RACES_TOTAL"] = race_df.apply(
        lambda row: row["B02001_002E"]
        + row["B02001_003E"]
        + row["B02001_004E"]
        + row["B02001_005E"]
        + row["B02001_006E"]
        + row["B02001_007E"],
        axis=1,
    )
    race_df["PERC_WHITE"] = race_df.apply(
        lambda row: (
            round(row["B02001_002E"] / row["RACES_TOTAL"], 3)
            if row["RACES_TOTAL"] > 0
            else 0
        ),
        axis=1,
    )
    race_df["PERC_POC"] = race_df.apply(
        lambda row: (
            round(
                (
                    row["B02001_003E"]
                    + row["B02001_004E"]
                    + row["B02001_005E"]
                    + row["B02001_006E"]
                    + row["B02001_007E"]
                )
                / row["RACES_TOTAL"],
                3,
            )
            if row["RACES_TOTAL"] > 0
            else 0
        ),
        axis=1,
    )

    # Calculate percentage hispanic
    ethnicity_df["PERC_HISPANIC"] = ethnicity_df.apply(
        lambda row: (
            round(row["B03003_003E"] / (row["B03003_002E"] + row["B03003_003E"]), 3)
            if (row["B03003_002E"] + row["B03003_003E"]) > 0
            else 0
        ),
        axis=1,
    )

    # Merge all the data
    lib_df = pd.merge(lib_df, income_df, on="GEO_ID", how="left")
    lib_df = pd.merge(lib_df, race_df, on="GEO_ID", how="left")
    lib_df = pd.merge(lib_df, ethnicity_df, on="GEO_ID", how="left")
    print(f"Found {lib_df.shape[0]:,} entries after merging")

    # Add link to URL
    lib_df["GEO_URL"] = lib_df.apply(
        lambda row: f"https://www.openstreetmap.org/?mlat={row['LATITUDE']}&mlon={row['LONGITUD']}&zoom=12",
        axis=1,
    )

    # Take only the data that we need, and rename them
    columns = {
        "LIBID": "id",
        "LIBNAME": "name",
        "ADDRESS": "address",
        "CITY": "city",
        "STABR": "state",
        "C_RELATN": "relationship",
        "GEOCODE": "geographic",
        "POPU_LSA": "pop_lsa",
        "BRANLIB": "branches",
        "LIBRARIA": "librarians",
        "TOTSTAFF": "staff",
        "TOTINCM": "op_revenue",
        "CAP_REV": "cap_revenue",
        "TOTPHYS": "tot_phys_items",
        "ELECCOLL": "tot_e_items",
        "VISITS": "visits",
        "TOTPRO": "programs",
        "ONPRO": "onsite_programs",
        "VIRPRO": "virtual_programs",
        "TOTATTEN": "program_attendance",
        "ONATTEN": "onsite_program_attendance",
        "VIRATTEN": "virtual_program_attendance",
        "PITUSR": "computer_sessions",
        "WIFISESS": "wireless_sessions",
        "OBEREG": "region",
        "LONGITUD": "lon",
        "LATITUDE": "lat",
        "LOCALE_ADD": "locale_type",
        "CDCODE": "district",
        "MEDIAN_INCOME": "income",
        "PERC_WHITE": "perc_white",
        "PERC_POC": "perc_poc",
        "PERC_HISPANIC": "perc_hispanic",
        # "B02001_001E": "population",
        # "B02001_002E": "pop_white",
        # "B02001_003E": "pop_black",
        # "B02001_004E": "pop_indigenous",
        # "B02001_005E": "pop_asian",
        # "B02001_006E": "pop_pacific",
        # "B02001_007E": "pop_other"
        # "B03003_002E": "pop_hispanic",
    }
    old_columns = list(columns.keys())
    new_columns = list(columns.values())
    lib_df = lib_df.filter(old_columns, axis=1)
    lib_df = lib_df.rename(columns=columns)

    # Convert to rows
    records = lib_df.to_dict("records")
    rows = []
    for record in records:
        row = []
        for col in new_columns:
            if col in record:
                row.append(record[col])
            else:
                row.append("")
        rows.append(row)

    json_out = {"cols": new_columns, "rows": rows}
    with open(args.outputfile, "w") as f:
        json.dump(json_out, f)
    print(f"Created data file at {args.outputfile}. Done.")


main()
