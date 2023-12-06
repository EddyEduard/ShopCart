const countrySelectTag = document.getElementById("country");
const vatTypeSelectTag = document.getElementById("vatType");
const vatCodeSelectTag = document.getElementById("vatCode");

let taxIDs = [], option = null;

const getTaxIDsByCountry = (country, vatType = null, isSelected = false, isReloadCountries = false) => {
    fetch("https://edituser.com/api/scriptoman/account/tax_ids")
        .then(response => response.json())
        .then(data => {
            taxIDs = data;
            vatCodeSelectTag.setAttribute("placeholder", "");

            if (isReloadCountries) {
                while (countrySelectTag.options.length > 1)
                    countrySelectTag.remove(1);

                taxIDs.filter((obj, index, array) =>
                    array.findIndex(item => item.country === obj.country) === index
                ).forEach(taxID => {
                    option = document.createElement("option");
                    option.value = taxID.country;
                    option.text = taxID.country;

                    if (taxID.country == country && isSelected)
                        option.setAttribute("selected", "");

                    countrySelectTag.add(option);
                });
            }

            while (vatTypeSelectTag.options.length > 0)
                vatTypeSelectTag.remove(0);

            taxIDs.splice(0, 0, { type: "none", country: null, description: null, pattern: null });

            taxIDs.filter(x => x.country == country || x.type == "none").forEach(taxID => {
                option = document.createElement("option");
                option.value = taxID.type;
                option.text = taxID.type != "none" ? `${taxID.type.toUpperCase()} - ${taxID.country}` : "--none--";

                if (taxID.country == country && taxID.type == vatType && isSelected)
                    option.setAttribute("selected", "");

                vatTypeSelectTag.add(option);
            });
        });
};

const onSelectCountry = e => {
    getTaxIDsByCountry(e.target.value);
};

const onSelectVatType = e => {
    const taxID = taxIDs.find(x => x.type == e.target.value && x.country == countrySelectTag.value);

    if (taxID != undefined && taxID.type != "none")
        vatCodeSelectTag.setAttribute("placeholder", taxID.pattern);
    else {
        vatCodeSelectTag.value = "";
        vatCodeSelectTag.setAttribute("placeholder", "");
    }
};