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
