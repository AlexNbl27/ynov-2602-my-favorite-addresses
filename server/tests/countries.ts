export async function getCountriesStartingWith(
    srch: string,
): Promise<string[]> {
    const response = await fetch(
        "https://api.first.org/data/v1/countries?limit=1000",
    );
    const json = await response.json();

    const countriesData = Object.values(json.data) as { country: string }[];
    const countries = countriesData.map((c) => c.country);

    return countries.filter((c) =>
        c.toLowerCase().startsWith(srch.toLowerCase())
    );
}
