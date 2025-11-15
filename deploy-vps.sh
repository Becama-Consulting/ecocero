#!/bin/bash

# Script de deploy seguro al VPS
# Uso: ./deploy-vps.sh

set -e

VPS_HOST="ubuntu@162.19.153.190"
VPS_PATH="/home/ubuntu/ecozero/html"
ENV_FILE=".env"

echo "🚀 Iniciando deploy a VPS..."

# 1. Verificar que existe .env local
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: No se encuentra el archivo .env"
    echo "   Copia .env.example a .env y configura tus credenciales"
    exit 1
fi

# 2. Build local
echo "📦 Building proyecto..."
npm run build

# 3. Subir .env al VPS (de forma segura)
echo "🔐 Subiendo variables de entorno..."
scp "$ENV_FILE" "$VPS_HOST:$VPS_PATH/.env"

# 4. Subir build al VPS
echo "📤 Subiendo archivos build..."
rsync -avz --delete dist/ "$VPS_HOST:$VPS_PATH/"

# 5. Verificar deployment
echo "✅ Verificando deployment..."
ssh "$VPS_HOST" << 'ENDSSH'
    cd /home/ubuntu/ecozero/html
    ls -la
    echo "📁 Archivos subidos correctamente"
ENDSSH

echo "✅ Deploy completado exitosamente!"
echo "🌐 URL: https://ecocero.t4tproyect.com"
