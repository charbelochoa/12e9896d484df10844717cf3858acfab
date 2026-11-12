# Guía de Despliegue de educatIA (Edición Segura)

## 1. Publicación del Frontend en GitHub Pages

El flujo `.github/workflows/pages.yml` ejecuta `python tools/build_pages.py` en cada actualización sobre la rama `main` y publica `artifacts/pages/` en GitHub Pages apuntando al gateway HTTPS de la plataforma:
`https://charbelochoa.github.io/12e9896d484df10844717cf3858acfab/`.

## 2. Despliegue del Servicio en Servidor Linux (systemd + Caddy)

El directorio `deploy/` contiene las unidades `systemd` (`educatia-secure.service` y `educatia-secure-corrected.service`) junto con los scripts `install.sh` y `update.sh`:

- El servicio escucha únicamente en la interfaz local (`127.0.0.1:8088` para modo estándar y `127.0.0.1:8090` para modo hardened) bajo usuario de sistema sin privilegios (`educatia-lab`) y con aislamiento estricto (`ProtectSystem=strict`, `NoNewPrivileges=true`, `IPAddressDeny=any`).
- **Caddy** gestiona los certificados TLS automáticos para `educatia-secure.136-118-8-128.sslip.io` y `educatia-secure-api.136-118-8-128.sslip.io`, inyecta encabezados de seguridad perimetral y reenvía las solicitudes hacia `127.0.0.1:8088`.

Para instalar o actualizar una instancia existente conservando respaldo previo:

```sh
sudo sh deploy/update.sh .
```
