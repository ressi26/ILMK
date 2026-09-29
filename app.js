// ==========================================
// ILMK - APP
// ==========================================

const STORAGE_KEY = "ilmk_services";
const SETTINGS_KEY = "ilmk_settings";

let services = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {
    hourlyRate: 10
};

let editingServiceId = null;


// ==========================================
// ELEMENTI
// ==========================================

const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".nav-item");

const serviceForm = document.getElementById("serviceForm");

const serviceDate = document.getElementById("serviceDate");
const serviceLocation = document.getElementById("serviceLocation");
const startTime = document.getElementById("startTime");
const endTime = document.getElementById("endTime");
const breakMinutes = document.getElementById("breakMinutes");
const hourlyRate = document.getElementById("hourlyRate");
const serviceNotes = document.getElementById("serviceNotes");

const calculatedHours = document.getElementById("calculatedHours");
const calculatedEarnings = document.getElementById("calculatedEarnings");


// ==========================================
// AVVIO APP
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    setToday();

    hourlyRate.value = settings.hourlyRate;

    document.getElementById("defaultHourlyRate").value =
        settings.hourlyRate;

    updateApp();

});


// ==========================================
// NAVIGAZIONE
// ==========================================

function showPage(pageId) {

    pages.forEach(page => {
        page.classList.remove("active");
    });

    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }


    navItems.forEach(item => {

        item.classList.remove("active");

        if (item.dataset.page === pageId) {
            item.classList.add("active");
        }

    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


navItems.forEach(item => {

    item.addEventListener("click", () => {
        showPage(item.dataset.page);
    });

});


document.querySelectorAll(".back-button").forEach(button => {

    button.addEventListener("click", () => {
        showPage(button.dataset.target);
    });

});


document.getElementById("newServiceButton")
    .addEventListener("click", () => {
        prepareNewService();
    });


document.getElementById("navAddButton")
    .addEventListener("click", () => {
        prepareNewService();
    });


document.getElementById("showAllButton")
    .addEventListener("click", () => {
        showPage("historyPage");
    });


document.getElementById("settingsButton")
    .addEventListener("click", () => {
        showPage("settingsPage");
    });


// ==========================================
// NUOVO SERVIZIO
// ==========================================

function prepareNewService() {

    editingServiceId = null;

    serviceForm.reset();

    setToday();

    breakMinutes.value = 0;
    hourlyRate.value = settings.hourlyRate;

    calculatedHours.textContent = "0 h";
    calculatedEarnings.textContent = "€ 0,00";

    const submitButton =
        serviceForm.querySelector('button[type="submit"]');

    submitButton.textContent = "Salva servizio";

    showPage("newServicePage");
}


// ==========================================
// DATA DI OGGI
// ==========================================

function setToday() {

    const today = new Date();

    const year = today.getFullYear();
    const month =
        String(today.getMonth() + 1).padStart(2, "0");

    const day =
        String(today.getDate()).padStart(2, "0");

    serviceDate.value =
        `${year}-${month}-${day}`;
}


// ==========================================
// CALCOLO ORE
// ==========================================

function calculateWorkedHours(start, end, pause = 0) {

    if (!start || !end) {
        return 0;
    }

    const [startHour, startMinute] =
        start.split(":").map(Number);

    const [endHour, endMinute] =
        end.split(":").map(Number);

    let startTotal =
        startHour * 60 + startMinute;

    let endTotal =
        endHour * 60 + endMinute;


    // Se termina dopo mezzanotte
    if (endTotal < startTotal) {
        endTotal += 24 * 60;
    }


    let workedMinutes =
        endTotal -
        startTotal -
        Number(pause || 0);


    if (workedMinutes < 0) {
        workedMinutes = 0;
    }


    return workedMinutes / 60;
}


// ==========================================
// AGGIORNAMENTO CALCOLO LIVE
// ==========================================

function updateLiveCalculation() {

    const hours =
        calculateWorkedHours(
            startTime.value,
            endTime.value,
            breakMinutes.value
        );

    const rate =
        Number(hourlyRate.value) || 0;

    const earnings =
        hours * rate;


    calculatedHours.textContent =
        formatHours(hours);

    calculatedEarnings.textContent =
        formatCurrency(earnings);
}


[
    startTime,
    endTime,
    breakMinutes,
    hourlyRate
].forEach(input => {

    input.addEventListener(
        "input",
        updateLiveCalculation
    );

});


// ==========================================
// SALVATAGGIO SERVIZIO
// ==========================================

serviceForm.addEventListener("submit", event => {

    event.preventDefault();


    const hours =
        calculateWorkedHours(
            startTime.value,
            endTime.value,
            breakMinutes.value
        );


    if (hours <= 0) {

        alert(
            "Controlla gli orari inseriti."
        );

        return;
    }


    const serviceData = {

        id:
            editingServiceId ||
            Date.now(),

        date:
            serviceDate.value,

        location:
            serviceLocation.value.trim(),

        start:
            startTime.value,

        end:
            endTime.value,

        breakMinutes:
            Number(breakMinutes.value) || 0,

        hourlyRate:
            Number(hourlyRate.value) || 0,

        hours:
            hours,

        earnings:
            hours *
            (Number(hourlyRate.value) || 0),

        notes:
            serviceNotes.value.trim()

    };


    if (editingServiceId) {

        const index =
            services.findIndex(
                service =>
                    service.id === editingServiceId
            );


        if (index !== -1) {
            services[index] = serviceData;
        }

    } else {

        services.push(serviceData);

    }


    saveServices();

    editingServiceId = null;

    serviceForm.reset();

    updateApp();

    showPage("homePage");

});


// ==========================================
// SALVATAGGIO DATI
// ==========================================

function saveServices() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(services)
    );

}


// ==========================================
// AGGIORNAMENTO GENERALE
// ==========================================

function updateApp() {

    sortServices();

    updateHome();

    renderHistory();

    updateStatistics();

}


// ==========================================
// ORDINAMENTO
// ==========================================

function sortServices() {

    services.sort((a, b) => {

        const dateA =
            new Date(`${a.date}T${a.start}`);

        const dateB =
            new Date(`${b.date}T${b.start}`);

        return dateB - dateA;

    });

}


// ==========================================
// HOME
// ==========================================

function updateHome() {

    const now = new Date();

    const currentYear =
        now.getFullYear();

    const currentMonth =
        now.getMonth();


    document.getElementById(
        "currentMonth"
    ).textContent =
        capitalize(
            new Intl.DateTimeFormat(
                "it-IT",
                {
                    month: "long",
                    year: "numeric"
                }
            ).format(now)
        );


    const monthServices =
        services.filter(service => {

            const date =
                parseLocalDate(service.date);

            return (
                date.getFullYear() ===
                    currentYear &&
                date.getMonth() ===
                    currentMonth
            );

        });


    const earnings =
        monthServices.reduce(
            (sum, service) =>
                sum + service.earnings,
            0
        );


    const hours =
        monthServices.reduce(
            (sum, service) =>
                sum + service.hours,
            0
        );


    document.getElementById(
        "monthlyEarnings"
    ).textContent =
        formatCurrency(earnings);


    document.getElementById(
        "monthlyHours"
    ).textContent =
        formatHours(hours);


    document.getElementById(
        "monthlyServices"
    ).textContent =
        monthServices.length;


    renderRecentServices();

}


// ==========================================
// ULTIMI SERVIZI
// ==========================================

function renderRecentServices() {

    const container =
        document.getElementById(
            "recentServices"
        );


    if (services.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💼</div>

                <h3>Nessun servizio</h3>

                <p>
                    I servizi che aggiungerai
                    compariranno qui.
                </p>
            </div>
        `;

        return;
    }


    const recent =
        services.slice(0, 4);


    container.innerHTML =
        recent
            .map(createServiceCard)
            .join("");

}


// ==========================================
// STORICO
// ==========================================

function renderHistory() {

    const container =
        document.getElementById(
            "historyList"
        );


    if (services.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ☷
                </div>

                <h3>Storico vuoto</h3>

                <p>
                    Non hai ancora registrato
                    nessun servizio.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        services
            .map(service => {

                return `
                    <div>

                        ${createServiceCard(service)}

                        <div style="
                            display:flex;
                            gap:8px;
                            margin-top:6px;
                            margin-bottom:12px;
                        ">

                            <button
                                onclick="editService(${service.id})"
                                style="
                                    flex:1;
                                    padding:10px;
                                    border:none;
                                    border-radius:12px;
                                    cursor:pointer;
                                "
                            >
                                Modifica
                            </button>

                            <button
                                onclick="deleteService(${service.id})"
                                style="
                                    flex:1;
                                    padding:10px;
                                    border:none;
                                    border-radius:12px;
                                    cursor:pointer;
                                "
                            >
                                Elimina
                            </button>

                        </div>

                    </div>
                `;

            })
            .join("");

}


// ==========================================
// CARD SERVIZIO
// ==========================================

function createServiceCard(service) {

    return `
        <div class="service-card">

            <div class="service-info">

                <h4>
                    ${escapeHTML(service.location)}
                </h4>

                <p>
                    ${formatDate(service.date)}
                    ·
                    ${service.start}
                    –
                    ${service.end}
                </p>

            </div>


            <div class="service-money">

                <strong>
                    ${formatCurrency(service.earnings)}
                </strong>

                <small>
                    ${formatHours(service.hours)}
                </small>

            </div>

        </div>
    `;

}


// ==========================================
// MODIFICA SERVIZIO
// ==========================================

function editService(id) {

    const service =
        services.find(
            service =>
                service.id === id
        );


    if (!service) {
        return;
    }


    editingServiceId = id;


    serviceDate.value =
        service.date;

    serviceLocation.value =
        service.location;

    startTime.value =
        service.start;

    endTime.value =
        service.end;

    breakMinutes.value =
        service.breakMinutes;

    hourlyRate.value =
        service.hourlyRate;

    serviceNotes.value =
        service.notes || "";


    updateLiveCalculation();


    const submitButton =
        serviceForm.querySelector(
            'button[type="submit"]'
        );

    submitButton.textContent =
        "Salva modifiche";


    showPage("newServicePage");

}


// ==========================================
// ELIMINA SERVIZIO
// ==========================================

function deleteService(id) {

    const service =
        services.find(
            service =>
                service.id === id
        );


    if (!service) {
        return;
    }


    const confirmation =
        confirm(
            `Vuoi eliminare il servizio "${service.location}"?`
        );


    if (!confirmation) {
        return;
    }


    services =
        services.filter(
            service =>
                service.id !== id
        );


    saveServices();

    updateApp();

}


// ==========================================
// STATISTICHE
// ==========================================

function updateStatistics() {

    const totalEarnings =
        services.reduce(
            (sum, service) =>
                sum + service.earnings,
            0
        );


    const totalHours =
        services.reduce(
            (sum, service) =>
                sum + service.hours,
            0
        );


    document.getElementById(
        "totalEarnings"
    ).textContent =
        formatCurrency(totalEarnings);


    document.getElementById(
        "totalHours"
    ).textContent =
        formatHours(totalHours);


    document.getElementById(
        "totalServices"
    ).textContent =
        services.length;


    renderMonthlyStatistics();

}


// ==========================================
// STATISTICHE PER MESE
// ==========================================

function renderMonthlyStatistics() {

    const container =
        document.getElementById(
            "monthlyStats"
        );


    if (services.length === 0) {

        container.innerHTML = "";

        return;
    }


    const months = {};


    services.forEach(service => {

        const date =
            parseLocalDate(service.date);

        const key =
            `${date.getFullYear()}-${date.getMonth()}`;


        if (!months[key]) {

            months[key] = {

                date:
                    new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        1
                    ),

                earnings: 0,

                hours: 0,

                services: 0

            };

        }


        months[key].earnings +=
            service.earnings;

        months[key].hours +=
            service.hours;

        months[key].services +=
            1;

    });


    const orderedMonths =
        Object.values(months)
            .sort(
                (a, b) =>
                    b.date - a.date
            );


    container.innerHTML =
        orderedMonths
            .map(month => {

                const name =
                    capitalize(
                        new Intl.DateTimeFormat(
                            "it-IT",
                            {
                                month: "long",
                                year: "numeric"
                            }
                        ).format(month.date)
                    );


                return `
                    <div class="month-stat-card">

                        <div>

                            <h4>
                                ${name}
                            </h4>

                            <p>
                                ${month.services}
                                ${month.services === 1
                                    ? "servizio"
                                    : "servizi"}
                                ·
                                ${formatHours(month.hours)}
                            </p>

                        </div>


                        <strong>
                            ${formatCurrency(month.earnings)}
                        </strong>

                    </div>
                `;

            })
            .join("");

}


// ==========================================
// IMPOSTAZIONI
// ==========================================

document.getElementById(
    "saveSettings"
).addEventListener("click", () => {

    const value =
        Number(
            document.getElementById(
                "defaultHourlyRate"
            ).value
        );


    if (
        Number.isNaN(value) ||
        value < 0
    ) {

        alert(
            "Inserisci una paga oraria valida."
        );

        return;
    }


    settings.hourlyRate =
        value;


    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );


    hourlyRate.value =
        settings.hourlyRate;


    alert(
        "Impostazioni salvate."
    );

});


// ==========================================
// FORMATTAZIONE EURO
// ==========================================

function formatCurrency(value) {

    return new Intl.NumberFormat(
        "it-IT",
        {
            style: "currency",
            currency: "EUR"
        }
    ).format(value || 0);

}


// ==========================================
// FORMATTAZIONE ORE
// ==========================================

function formatHours(decimalHours) {

    const totalMinutes =
        Math.round(
            (decimalHours || 0) * 60
        );


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const minutes =
        totalMinutes % 60;


    if (hours === 0) {

        return `${minutes} min`;

    }


    if (minutes === 0) {

        return `${hours} h`;

    }


    return `${hours} h ${minutes} min`;

}


// ==========================================
// DATA ITALIANA
// ==========================================

function formatDate(dateString) {

    const date =
        parseLocalDate(dateString);


    return new Intl.DateTimeFormat(
        "it-IT",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(date);

}


// ==========================================
// PARSING DATA SENZA PROBLEMI FUSO ORARIO
// ==========================================

function parseLocalDate(dateString) {

    const [year, month, day] =
        dateString
            .split("-")
            .map(Number);


    return new Date(
        year,
        month - 1,
        day
    );

}


// ==========================================
// MAIUSCOLA
// ==========================================

function capitalize(text) {

    if (!text) {
        return "";
    }


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


// ==========================================
// SICUREZZA TESTO
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

}


// ==========================================
// SERVICE WORKER PWA
// ==========================================

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register("./service-worker.js")
                .catch(error => {

                    console.log(
                        "Service Worker:",
                        error
                    );

                });

        }
    );

}