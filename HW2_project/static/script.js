let data = {
    searchValue: '',
    currentNav: 'company-nav',
    searchResult: null
};


const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-btn');
const clearButton = document.getElementById('clear-btn');
const navigationDiv = document.getElementById('navigation');

function setSearchInput(value) {
    document.getElementById('search-input').value = value;
}

function handleClickNav(e) {
    data.currentNav = e.target.id;
    renderNav();
    renderContent();
}

function renderNav() {
    if (!data.searchResult) {
        navigationDiv.style.display = 'none';
        return;
    } else {
        navigationDiv.style.display = 'flex';
    }

    const navs = navigationDiv.children;
    for (let i = 0; i < navs.length; i++) {
        const nav = navs[i];
        nav.classList.remove('active');
        nav.removeEventListener('click', handleClickNav);
        nav.addEventListener('click', handleClickNav);
    }
    document.getElementById(data.currentNav).classList.add('active');
}


function renderCompany() {
    if (!data.searchResult?.profile) {
        return;
    }
    const companyLogoImage = document.getElementById('company-logo');
    const companyName = document.getElementById('company-name');
    const stockTickerSymbol = document.getElementById('stock-ticker-symbol');
    const stockExchangeCode = document.getElementById('stock-exchange-code');
    const companyStartDate = document.getElementById('company-start-date');
    const category = document.getElementById('category');

    companyLogoImage.src = data.searchResult.profile.logo;
    companyName.textContent = data.searchResult.profile.name;
    stockTickerSymbol.textContent = data.searchResult.profile.ticker;
    stockExchangeCode.textContent = data.searchResult.profile.exchange;
    companyStartDate.textContent = data.searchResult.profile.ipo;
    category.textContent = data.searchResult.profile.finnhubIndustry;
}

function renderSummary() {
    if (!data.searchResult?.quote) {
        return;
    }
    const summaryStockTickerSymbol = document.getElementById('summary-stock-ticker-symbol');
    const tradingDay = document.getElementById('trading-day');
    const previousClosingPrice = document.getElementById('previous-closing-price');
    const openingPrice = document.getElementById('opening-price');
    const highPrice = document.getElementById('high-price');
    const lowPrice = document.getElementById('low-price');
    const change = document.getElementById('change');
    const changePercent = document.getElementById('change-percent');
    const changeIcon = data.searchResult.quote.d > 0 ?
        `<img src="/static/img/GreenArrowUp.png" width="15px"/>` :
        `<img src="/static/img/RedArrowDown.png" width="15px"/>`;
    summaryStockTickerSymbol.textContent = data.searchResult.profile.ticker;
    tradingDay.textContent = new Date(data.searchResult.quote.t * 1000).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    previousClosingPrice.textContent = data.searchResult.quote.pc;
    openingPrice.textContent = data.searchResult.quote.o;
    highPrice.textContent = data.searchResult.quote.h;
    lowPrice.textContent = data.searchResult.quote.l;
    change.innerHTML = data.searchResult.quote.d + changeIcon;
    changePercent.innerHTML = data.searchResult.quote.dp + changeIcon;

    const strongSell = document.getElementById('strong-sell');
    const sell = document.getElementById('sell');
    const hold = document.getElementById('hold');
    const buy = document.getElementById('buy');
    const strongBuy = document.getElementById('strong-buy');
    const bars = [
        [strongSell, 'strongSell'],
        [sell, 'sell'],
        [hold, 'hold'],
        [buy, 'buy'],
        [strongBuy, 'strongBuy']
    ];

    for (let bar of bars) {
        bar[0].style.display = 'none';
    }
    for (let index = 0; index < data.searchResult.recommendation.length; index++) {
        const recommendationItem = data.searchResult.recommendation[index];
        const bar = bars[index][0];
        bar.style.display = 'flex';
        const barValue = bars[index][1];
        bar.textContent = recommendationItem[barValue];
    }
}

function renderCharts() {
    console.log(data)
    const resultsData = data.searchResult.chart.results;
    let prices = [];
    let tradingVolumes = [];
    let latestDate = 0;
    let earliestDate = new Date().getTime();


    resultsData.forEach(entry => {
        const {t: timeStamp, c: closePrice, v: volume} = entry;

        latestDate = Math.max(latestDate, timeStamp);
        earliestDate = Math.min(earliestDate, timeStamp);


        prices.push([timeStamp, closePrice]);
        tradingVolumes.push([timeStamp, volume]);
    });
    console.log(prices, tradingVolumes)
    Highcharts.stockChart('chart', {
        rangeSelector: {
            allButtonsEnabled: true,
            buttons: [
                {type: 'week', count: 1, text: '7d'},
                {type: 'day', count: 15, text: '15d'},
                {type: 'month', count: 1, text: '1m'},
                {type: 'month', count: 3, text: '3m'},
                {type: 'month', count: 6, text: '6m'}
            ],
            buttonTheme: {width: 30},
            selected: 0,
            inputEnabled: false
        },
        chart: {
            zoomType: 'x',
        },
        title: {
            text: `Stock Price ${data.searchResult.profile.name} ${new Date().toISOString().split('T')[0]}`
        },
        subtitle: {
            text: 'Source: <a href="https://polygon.io/" target="_blank">Polygon.io</a>',
            style: {color: '#1a0dab', textDecoration: 'underline', margin: '20px'}
        },
        xAxis: {
            type: 'datetime',
            title: {text: 'Date'},
        },
        yAxis: [{
            title: {text: 'Stock Price'},
            opposite: false,
        }, {
            title: {text: 'Volume'},
            labels: {
                formatter: function () {
                    return (this.value / 1000000) + 'M';
                }
            },
            opposite: true,
            height: '25%',
            top: '75%',
        }],
        series: [{
            name: 'Stock Price',
            data: prices,
            type: 'area',
            tooltip: {valueDecimals: 2},
            fillColor: {
                linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                stops: [
                    [0, Highcharts.getOptions().colors[0]],
                    [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                ]
            },
            gapSize: 5,
             threshold: null,
            dataGrouping: {enabled: false}
        }, {
            name: 'Volume',
            data: tradingVolumes,
            type: 'column',
            pointPadding: 0,
            groupPadding: 0.1,
            pointWidth: 5,
            dataGrouping: {enabled: false},
            yAxis: 1,
            tooltip: {valueDecimals: 0},
            color: 'black',
        }],
        credits: {enabled: false},
        exporting: {enabled: true}
    });

}

function renderNews() {
    const newsList = document.getElementById('news-list');
    const news = data.searchResult.news.filter(item => item.image).slice(0, 5);
    let innerHTML = '';
    for (let newsItem of news) {
        innerHTML += `
            <li class="news-item">
                <img width="100" height="100" src="${newsItem.image}" alt=""/>
                <div>
                    <h4>${newsItem.headline}</h4>
                    <p>${new Date(newsItem.datetime * 1000).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })}
                    </p>
                    <p>
                        <a target="_blank" href="${newsItem.url}">See Original Post</a>
                    </p>
                </div>
            </li>
        `;
    }
    newsList.innerHTML = innerHTML;
}

function renderContent() {
    const contents = document.querySelectorAll('.content');
    const contentId = data.currentNav.split('-')[0];

    for (let i = 0; i < contents.length; i++) {
        contents[i].style.display = 'none';
    }
    if (data.searchResult) {
        document.getElementById(contentId).style.display = 'flex';
    }
    switch (contentId) {
        case 'company':
            renderCompany();
            break;
        case 'summary':
            renderSummary();
            break;
        case 'charts':
            renderCharts();
            break;
        case 'news':
            renderNews();
            break;
    }
}


searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchKeyword = data.searchValue;
    ajaxGet(`/searchStock?ticker_symbol=${searchKeyword}`)
        .then(searchResult => {

            data.searchResult = searchResult;
            if (searchResult.news.length === 0) {
                document.getElementById('error').style.display = 'block';
                data.searchResult = null;
            } else {
                document.getElementById('error').style.display = 'none';
                renderNav();
                renderContent();
            }
        });
});

clearButton.addEventListener('click', () => {
    setSearchInput('');
    data.searchResult = null;
    data.currentNav = 'company-nav';
    renderNav();
    renderContent();
});

searchInput.addEventListener('input', () => {
    data.searchValue = searchInput.value;
});


window.onload = function () {
    renderNav();
    renderContent();
}




