import requests
from dateutil.relativedelta import relativedelta

# API keys
finnhub_api_key = "cnchqr1r01qkavtmhtk0cnchqr1r01qkavtmhtkg"
polygon_api_key = "XMXv7qDQQjX30v2YMZt19iDB8DAu0O9x"

def get_stock_profile(ticker_symbol):
    profile_url = f"https://finnhub.io/api/v1/stock/profile2?symbol={ticker_symbol}&token={finnhub_api_key}"
    response = requests.get(profile_url)
    return response.json()

def get_stock_quote(ticker_symbol):
    quote_url = f"https://finnhub.io/api/v1/quote?symbol={ticker_symbol}&token={finnhub_api_key}"
    response = requests.get(quote_url)
    return response.json()

def get_stock_recommendation(ticker_symbol):
    recommendation_url = f"https://finnhub.io/api/v1/stock/recommendation?symbol={ticker_symbol}&token={finnhub_api_key}"
    response = requests.get(recommendation_url)
    return response.json()

def get_stock_chart(ticker_symbol, date_current):
    date_6months_prior = date_current - relativedelta(months=6)
    chart_url = f"https://api.polygon.io/v2/aggs/ticker/{ticker_symbol}/range/1/day/{date_6months_prior.strftime('%Y-%m-%d')}/{date_current.strftime('%Y-%m-%d')}?adjusted=true&sort=asc&apiKey={polygon_api_key}"
    response = requests.get(chart_url)
    return response.json()

def get_company_news(ticker_symbol, date_current):
    date_30days_prior = date_current - relativedelta(days=30)
    news_url = f"https://finnhub.io/api/v1/company-news?symbol={ticker_symbol}&from={date_30days_prior.strftime('%Y-%m-%d')}&to={date_current.strftime('%Y-%m-%d')}&token={finnhub_api_key}"
    response = requests.get(news_url)
    return response.json()
