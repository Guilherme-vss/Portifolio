# Site estático servido pelo nginx — imagem final com ~10 MB.
FROM nginx:1.27-alpine

# Copia os arquivos do site para a pasta padrão do nginx
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

EXPOSE 80
