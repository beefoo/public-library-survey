import itertools
from operator import itemgetter
import pandas as pd
from tqdm import tqdm


def calculate_per(df, value_key, total_key, new_key, precision=3, multiplier=1):
    curve = 1.0
    df[new_key] = df.apply(
        lambda row: (
            round(pow(row[value_key] / row[total_key], curve) * multiplier, precision)
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

    lib_df["PERC_WHITE"] = lib_df.apply(
        lambda row: (
            round(row["B02001_002E"] / row["RACES_TOTAL"] * 100, 2)
            if row["RACES_TOTAL"] > 0
            else 0
        ),
        axis=1,
    )
    lib_df["PERC_BLACK"] = lib_df.apply(
        lambda row: (
            round(row["B02001_003E"] / row["RACES_TOTAL"] * 100, 2)
            if row["RACES_TOTAL"] > 0
            else 0
        ),
        axis=1,
    )
    lib_df["PERC_INDIGENOUS"] = lib_df.apply(
        lambda row: (
            round(row["B02001_004E"] / row["RACES_TOTAL"] * 100, 2)
            if row["RACES_TOTAL"] > 0
            else 0
        ),
        axis=1,
    )
    lib_df["PERC_API"] = lib_df.apply(
        lambda row: (
            round(
                (row["B02001_005E"] + row["B02001_006E"]) / row["RACES_TOTAL"] * 100, 2
            )
            if row["RACES_TOTAL"] > 0
            else 0
        ),
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

    age_cols = [
        "GEO_ID",
        "S0101_C02_022E",  # Percent under 18 years
        "S0101_C02_030E",  # Percent 65 years and older
        "S0101_C01_032E",
    ]
    age_df = pd.read_csv(
        f"{path}ACSST5Y2023.S0101-Data-Age-By-{by}.csv",
        skiprows=[1],
        na_values="-",
        dtype={
            "S0101_C02_022E": float,
            "S0101_C02_030E": float,
            "S0101_C01_032E": float,
        },
    )
    print(
        f"Found {age_df.shape[0]:,} entries from the Census age and sex dataset by {by}"
    )

    # Merge on GEO_ID
    census_df = pd.merge(income_df, race_df, on="GEO_ID", how="left")
    census_df = pd.merge(census_df, ethnicity_df, on="GEO_ID", how="left")
    census_df = pd.merge(census_df, age_df[age_cols], on="GEO_ID", how="left")

    return census_df


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


def get_election_data(path="data/", year=2020):
    election_df = pd.read_csv(f"{path}countypres_2000-2020.csv")
    print(
        f"Found {election_df.shape[0]:,} entries in the presidential elections dataset"
    )

    # Fill NAN
    election_df.fillna({"candidatevotes": 0, "totalvotes": 0}, inplace=True)

    # Filter by year
    election_df = election_df[election_df["year"] == year].reset_index(drop=True)
    election_df["county_fips"] = election_df.apply(
        lambda row: parse_int(row["county_fips"], 0), axis=1
    )

    # Get a list of unique counties
    counties = list(set(election_df["county_fips"].to_list()))
    print(f"Found {len(counties)} counties with data for year {year}")

    print("Parsing election data...")
    election_data = []
    for county in tqdm(counties):
        record = {"county_fips": county}
        county_df = election_df[election_df["county_fips"] == county]
        # Check to see if there are totals
        totals_df = county_df[county_df["mode"] == "TOTAL"]
        if totals_df.shape[0] > 0:
            record["demvotes"] = totals_df.loc[
                totals_df["party"] == "DEMOCRAT", "candidatevotes"
            ].values[0]
            record["repvotes"] = totals_df.loc[
                totals_df["party"] == "REPUBLICAN", "candidatevotes"
            ].values[0]
            record["totalvotes"] = totals_df["totalvotes"].values[0]
        # Otherwise, aggregate all columns
        else:
            record["demvotes"] = county_df.loc[
                county_df["party"] == "DEMOCRAT", "candidatevotes"
            ].sum()
            record["repvotes"] = county_df.loc[
                county_df["party"] == "REPUBLICAN", "candidatevotes"
            ].sum()
            record["totalvotes"] = county_df["totalvotes"].values[0]
        election_data.append(record)

    # Convert back to data frame
    combined_df = pd.DataFrame(election_data)

    # Calculate percentages (negative for dem, positive for rep-leaning)
    combined_df["vote_points"] = combined_df.apply(
        lambda row: (
            round(
                (
                    row["repvotes"] / row["totalvotes"]
                    - row["demvotes"] / row["totalvotes"]
                )
                * 100,
                2,
            )
            if row["totalvotes"] > 0
            else 0
        ),
        axis=1,
    )

    return combined_df


def group_list(arr, groupBy, sort=False, desc=True):
    """Group a list by value"""
    groups = []
    arr = sorted(arr, key=itemgetter(*groupBy))
    for key, items in itertools.groupby(arr, key=itemgetter(*groupBy)):
        group = {}
        litems = list(items)
        count = len(litems)
        group["groupKey"] = tuple(groupBy)
        group["items"] = litems
        group["count"] = count
        groups.append(group)
    if sort:
        isReversed = desc
        groups = sorted(groups, key=lambda k: k["count"], reverse=isReversed)
    return groups


def merge_data(
    lib_df,
    census_county_df,
    census_zip_df,
    election_df,
):
    # Add Geo ID's to use to merge with Census data
    lib_df["GEO_ID_COUNTY"] = lib_df.apply(
        lambda row: f"0500000US{str(parse_int(row['FIPS Code'], 0)).zfill(5)}", axis=1
    )
    election_df["GEO_ID_COUNTY"] = election_df.apply(
        lambda row: f"0500000US{str(parse_int(row['county_fips'], 0)).zfill(5)}", axis=1
    )
    lib_df["GEO_ID_ZIPCODE"] = lib_df.apply(
        lambda row: f"860Z200US{str(parse_int(row['ZIP'], 0)).zfill(5)}", axis=1
    )

    # Create lookup tables on GEO_ID
    census_county = dict(
        [(row["GEO_ID"], row) for row in census_county_df.to_records()]
    )
    census_zip = dict([(row["GEO_ID"], row) for row in census_zip_df.to_records()])

    # Next, add Census data to lib_df
    census_fields = [
        "B19013_001E",  # Median houshold income
        "B02001_001E",  # Population
        "B02001_002E",  # White
        "B02001_003E",  # Black
        "B02001_004E",  # Indigenous
        "B02001_005E",  # Asian
        "B02001_006E",  # Pacific Islander
        "B02001_007E",  # Other race
        "B03003_002E",  # Hispanic/Latino
        "B03003_003E",  # Not Hispanic/Latino
        "S0101_C02_022E",  # Percent under 18 years
        "S0101_C02_030E",  # Percent 65 years and older
        "S0101_C01_032E",  # Median age
    ]
    for field in census_fields:
        lib_df[field] = lib_df.apply(
            lambda row: get_census_value(row, field, census_county, census_zip),
            axis=1,
        )
        lib_df[field].fillna(-1, inplace=True)

    # Merge the elections data
    lib_df = pd.merge(lib_df, election_df, on="GEO_ID_COUNTY", how="left")

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
