from flask import Flask, request,jsonify
from newspaper import Article
import json
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


@app.route('/fetch', methods=['GET', 'POST'])
def parse_request():
    url = request.args.get('url')
    print('here')
    print(url)
    article = Article(url)
    article.download()
    article.parse()
    article.nlp()
    article_text = article.text
    article_authors = article.authors
    article_title = article.title
    article_links = article.images
    article_videos = article.movies
    article_summary = article.summary
    article_keywords = article.keywords
    article_html = article.html

    final_output = dict({"text": article_text, "authors": article_authors, "title": article_title, "links": article_links, "videos": article_videos,
                    "summary": article_summary, "keywords": article_keywords, "html": article_html})

    return str(final_output)


if __name__ == "__main__":
    app.run(debug=True)
