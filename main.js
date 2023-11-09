async function categoryData(category) {
    const url = "https://botw-compendium.herokuapp.com/api/v3/compendium/category/" + category;
    const response = await fetch(url);
    const json = await response.json();
    return json;
}

async function showCategory(category) {
    main.innerHTML = "";
    main.classList.add("loading");

    const json = await categoryData(category);
    const entries = json.data.sort((a, b) => a.id - b.id);


    entries.forEach((entry) => {
        const container = document.createElement("button");
        container.classList.add("container");
        container.addEventListener("click", () => showEntry(entry.id));

        const name = document.createElement("p");
        name.textContent = entry.name;

        const image = document.createElement("img");
        image.width = 100;
        image.height = 100;
        image.loading = "lazy";
        image.src = entry.image;
        image.alt = entry.name;

        container.append(image, name);
        main.append(container);
        main.classList.remove("loading");
    });
}

async function entryData(id) {
    const url = "https://botw-compendium.herokuapp.com/api/v3/compendium/entry/" + id;
    const response = await fetch(url);
    const json = await response.json();
    return json;
}

async function showEntry(id) {
    const dialogHeader = dialog.querySelector("header");
    const dialogEntry = dialog.querySelector(".entry");
    const dialogFooter = dialog.querySelector("footer");

    dialogHeader.innerHTML = "";
    dialogEntry.innerHTML = "";
    dialogFooter.innerHTML = "";
    dialog.showModal();
    dialog.classList.add("loading");

    const json = await entryData(id);
    const entry = json.data;

    const title = document.createElement("h2");
    title.textContent = entry.name;

    dialogHeader.append(title);

    const image = document.createElement("img");
    image.src = entry.image;
    image.alt = entry.name;

    const content = document.createElement("div");

    const descriptionTitle = document.createElement("h3");
    descriptionTitle.textContent = "Description";
    const description = document.createElement("p");
    description.textContent = entry.description;

    const locationsTitle = document.createElement("h3");
    locationsTitle.textContent = "Common Locations";
    const locationsList = entry.common_locations;
    let locations;

    if (locationsList != null && locationsList.length >= 1) {
        locations = document.createElement("ul");
        locationsList.forEach((location) => {
            const locationItem = document.createElement("li");
            locationItem.textContent = location;
            locations.append(locationItem);
        });
    }
    else {
        locations = document.createElement("p");
        locations.textContent = "Unknown";
    }

    content.append(descriptionTitle, description, locationsTitle, locations);

    if ((entry.category == "creatures" && !entry.edible) || entry.category == "monsters" || entry.category == "treasure") {
        const materialsTitle = document.createElement("h3");
        materialsTitle.textContent = "Recoverable Materials";
        const materialsList = entry.drops;
        let materials;
        if (materialsList != null && materialsList.length >= 1) {
            materials = document.createElement("ul");
            materialsList.forEach((material) => {
                const materialItem = document.createElement("li");
                materialItem.textContent = material;
                materials.append(materialItem);
            });
        }
        else {
            materials = document.createElement("p");
            materials.textContent = "None";
        }

        content.append(materialsTitle, materials);
    }
    else if (entry.category == "creatures" || entry.category == "materials") {
        const heartsTitle = document.createElement("h3");
        heartsTitle.textContent = "Hearts Recovered";
        const hearts = document.createElement("p");
        hearts.textContent = entry.hearts_recovered;

        const cookingEffectTitle = document.createElement("h3");
        cookingEffectTitle.textContent = "Cooking Effect";
        const cookingEffect = document.createElement("p");
        cookingEffect.classList.add("capitalize");
        if (entry.cooking_effect === "") cookingEffect.textContent = "None";
        else cookingEffect.textContent = entry.cooking_effect;

        content.append(heartsTitle, hearts, cookingEffectTitle, cookingEffect);
    }
    else if (entry.category == "equipment" && entry.properties.attack !== null) {
        const propertiesTitle = document.createElement("h3");
        propertiesTitle.textContent = "Properties";
        const properties = document.createElement("p");
        if (entry.properties.attack === 0) properties.textContent = "Defense: " + entry.properties.defense;
        else properties.textContent = "Attack: " + entry.properties.attack;

        content.append(propertiesTitle, properties);
    }

    dialogEntry.append(image, content);

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.addEventListener("click", () => dialog.close());

    dialogFooter.append(closeButton);

    dialog.classList.remove("loading");
}

const url = new URL(location.href);
const parameters = url.searchParams;
const category = parameters.get("category");

const main = document.querySelector("main");
const nav = document.querySelector("nav");
const dialog = document.querySelector("dialog");
const buttons = nav.querySelectorAll("button");
buttons.forEach((button) => {
    button.addEventListener("click", () => {
        if (!button.classList.contains("selected") && !main.classList.contains("loading")) {
            showCategory(button.id);
            history.pushState(history.state, document.title, url.origin + url.pathname + "?category=" + button.id);

            buttons.forEach((b) => {
                if (button == b) b.classList.add("selected");
                else b.classList.remove("selected");
            });
        }
    });
});

if (!category) buttons[0].click();
else nav.querySelector("#" + category).click();