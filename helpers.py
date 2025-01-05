import pandas as pd


def calculate_per(df, value_key, total_key, new_key):
    curve = 1.0
    df[new_key] = df.apply(
        lambda row: (
            round(pow(row[value_key] / row[total_key], curve), 3)
            if row[total_key] > 0 and row[value_key] > 0
            else 0
        ),
        axis=1,
    )
    return df


def calculate_percent_pos(lib_df):
    # Caculate the total of all races for each row
    lib_df["RACES_TOTAL"] = lib_df.apply(
        lambda row: row["B02001_002E"]  # white
        + row["B02001_003E"]  # black
        + row["B02001_004E"]  # indigenous
        + row["B02001_005E"]  # asian
        + row["B02001_006E"]  # pacific
        + row["B02001_007E"],  # other
        axis=1,
    )

    # Calculate the percent that are people of color
    lib_df["PERC_POC"] = lib_df.apply(
        lambda row: (
            round(
                (
                    row["B02001_003E"]  # black
                    + row["B02001_004E"]  # indigenous
                    + row["B02001_005E"]  # asian
                    + row["B02001_006E"]  # pacific
                    + row["B02001_007E"]  # other
                )
                / row["RACES_TOTAL"]
                * 100,
                2,
            )
            if row["RACES_TOTAL"] > 0
            else 0
        ),
        axis=1,
    )

    # Calculate percentage hispanic
    lib_df["PERC_HISPANIC"] = lib_df.apply(
        lambda row: (
            round(
                row["B03003_003E"] / (row["B03003_002E"] + row["B03003_003E"]) * 100, 2
            )
            if (row["B03003_002E"] + row["B03003_003E"]) > 0
            else 0
        ),
        axis=1,
    )

    # Add merged POC or Hispanic
    lib_df["PERC_POC_OR_HISPANIC"] = lib_df.apply(
        lambda row: max(row["PERC_POC"], row["PERC_HISPANIC"]), axis=1
    )
    return lib_df


def calculate_rank(df, value_key, new_key, descending=False):
    precision = 10000
    df[value_key].fillna(value=-1, inplace=True)
    values = df[value_key].tolist()
    values = [int(round(v * precision)) for v in values]
    values.sort(reverse=descending)
    df[new_key] = df.apply(
        lambda row: (values.index(int(round(row[value_key] * precision))) + 1),
        axis=1,
    )
    return df


def find_where(df, key, value):
    results = df.query(f'{key} == "{value}"')
    print(results.shape[0])
    if results.shape[0] > 0:
        return results.iloc[0]
    return None


def get_census_data(path="data/", by="County"):
    income_df = pd.read_csv(
        f"{path}ACSDT5Y2023.B19013-Data-Household-Income-By-{by}.csv", skiprows=[1]
    )
    print(
        f"Found {income_df.shape[0]:,} entries from the Census median household income dataset by {by}"
    )

    race_df = pd.read_csv(
        f"{path}ACSDT5Y2023.B02001-Data-Race-By-{by}.csv", skiprows=[1]
    )
    print(f"Found {race_df.shape[0]:,} entries from the Census race dataset by {by}")

    ethnicity_df = pd.read_csv(
        f"{path}ACSDT5Y2023.B03003-Data-Hispanic-By-{by}.csv", skiprows=[1]
    )
    print(
        f"Found {ethnicity_df.shape[0]:,} entries from the Census ethnicity (Hispanic or Latino) dataset by {by}"
    )
    return (income_df, race_df, ethnicity_df)


def get_census_value(row, field, census_county, census_zip):
    value = -1
    # If a city, use county data
    if (
        row["LOCALE_ADD"] < 20
        and row["LOCALE_ADD"] > 0
        and row["GEO_ID_COUNTY"] in census_county
    ):
        value = census_county[row["GEO_ID_COUNTY"]][field]

    # Otherwise, use zipcode data
    elif row["GEO_ID_ZIPCODE"] in census_zip:
        value = census_zip[row["GEO_ID_ZIPCODE"]][field]

    return value


def merge_data(
    lib_df,
    income_county_df,
    race_county_df,
    ethnicity_county_df,
    income_zip_df,
    race_zip_df,
    ethnicity_zip_df,
):
    # Add Geo ID's to use to merge with Census data
    lib_df["GEO_ID_COUNTY"] = lib_df.apply(
        lambda row: f"0500000US{str(parse_int(row['FIPS Code'], 0)).zfill(5)}", axis=1
    )
    lib_df["GEO_ID_ZIPCODE"] = lib_df.apply(
        lambda row: f"860Z200US{str(parse_int(row['ZIP'], 0)).zfill(5)}", axis=1
    )

    # Merge census data and create a lookup table on GEO_ID
    census_county_df = pd.merge(
        income_county_df, race_county_df, on="GEO_ID", how="left"
    )
    census_county_df = pd.merge(
        census_county_df, ethnicity_county_df, on="GEO_ID", how="left"
    )
    census_county = dict(
        [(row["GEO_ID"], row) for row in census_county_df.to_records()]
    )
    census_zip_df = pd.merge(income_zip_df, race_zip_df, on="GEO_ID", how="left")
    census_zip_df = pd.merge(census_zip_df, ethnicity_zip_df, on="GEO_ID", how="left")
    census_zip = dict([(row["GEO_ID"], row) for row in census_zip_df.to_records()])

    # Next, add Census data to lib_df
    census_fields = [
        "B19013_001E",
        "B02001_001E",
        "B02001_002E",
        "B02001_003E",
        "B02001_004E",
        "B02001_005E",
        "B02001_006E",
        "B02001_007E",
        "B03003_002E",
        "B03003_003E",
    ]
    for field in census_fields:
        lib_df[field] = lib_df.apply(
            lambda row: get_census_value(row, field, census_county, census_zip),
            axis=1,
        )
    return lib_df


def parse_int(value, default_value=-1):
    parsed_value = default_value
    try:
        svalue = str(value).replace(",", "").replace("+", "")
        if "." in svalue:
            svalue = svalue.split(".")[0]
        parsed_value = int(svalue)
    except:
        parsed_value = default_value
    return parsed_value


def round_int(value):
    return int(round(value))
