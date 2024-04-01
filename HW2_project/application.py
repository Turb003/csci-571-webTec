from flask import Flask, render_template, jsonify, request
from finnub import get_stock_profile, get_stock_chart, get_stock_quote, get_stock_recommendation, get_company_news
from datetime import datetime

application = Flask(__name__)

@application.route('/')
def home():
    return application.send_static_file('index.html')

@application.route('/searchStock')
def search_stock():
    ticker_symbol = request.args.get('ticker_symbol')
    if not ticker_symbol:
        return jsonify({"error": "Ticker symbol is required"}), 400

    ticker_symbol = ticker_symbol.upper()
    current_date = datetime.now()

    profile_data = get_stock_profile(ticker_symbol)
    quote_data = get_stock_quote(ticker_symbol)
    recommendation_data = get_stock_recommendation(ticker_symbol)
    chart_data = get_stock_chart(ticker_symbol, current_date)
    news_data = get_company_news(ticker_symbol, current_date)


    aggregated_data = {
        "profile": profile_data,
        "quote": quote_data,
        "recommendation": recommendation_data,
        "chart": chart_data,
        "news": news_data
    }

    return jsonify(aggregated_data)

if __name__ == '__main__':
    application.debug = True
    application.run()
