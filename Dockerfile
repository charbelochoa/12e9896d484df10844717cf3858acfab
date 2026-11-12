FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /srv/educatia
RUN useradd --uid 10001 --create-home educatia && mkdir /srv/educatia/data && chown educatia:educatia /srv/educatia/data
COPY --chown=educatia:educatia app /srv/educatia/app
COPY --chown=educatia:educatia web /srv/educatia/web
USER 10001:10001
EXPOSE 8088
HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8088/api/health',timeout=2)" || exit 1
CMD ["python", "-m", "app.server", "--host", "0.0.0.0", "--port", "8088", "--data", "/srv/educatia/data"]
