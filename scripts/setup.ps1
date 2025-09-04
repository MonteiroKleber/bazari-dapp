# Bazari Setup Script for Windows
# PowerShell script to set up the development environment

Write-Host "🌟 Welcome to Bazari Setup!" -ForegroundColor Green
Write-Host "This script will help you set up your development environment." -ForegroundColor White
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param($Command)
    
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            Write-Host "✅ $Command is installed" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "❌ $Command is not installed. Please install it first." -ForegroundColor Red
        return $false
    }
}

# Check required tools
Write-Host "Checking required tools..." -ForegroundColor Yellow

$allToolsInstalled = $true

if (-not (Test-Command "node")) { $allToolsInstalled = $false }
if (-not (Test-Command "pnpm")) { $allToolsInstalled = $false }
if (-not (Test-Command "docker")) { $allToolsInstalled = $false }
if (-not (Test-Command "docker-compose")) { $allToolsInstalled = $false }

if (-not $allToolsInstalled) {
    Write-Host "Please install missing tools and run this script again." -ForegroundColor Red
    exit 1
}

# Check Node version
$nodeVersion = node -v
$majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')

if ($majorVersion -lt 18) {
    Write-Host "❌ Node.js version must be >= 18.0.0" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ Node.js version is compatible" -ForegroundColor Green
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Setup environment variables
Write-Host ""
Write-Host "⚙️ Setting up environment variables..." -ForegroundColor Yellow

if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Created .env.local from .env.example" -ForegroundColor Green
    Write-Host "📝 Please review and update .env.local with your settings" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

# Start Docker services
Write-Host ""
Write-Host "🐳 Starting Docker services..." -ForegroundColor Yellow
docker-compose -f infra/docker-compose.dev.yml up -d

# Wait for services
Write-Host ""
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service health
function Test-Service {
    param($ServiceName)
    
    $result = docker-compose -f infra/docker-compose.dev.yml ps $ServiceName 2>$null
    if ($result -match "Up") {
        Write-Host "✅ $ServiceName is running" -ForegroundColor Green
    } else {
        Write-Host "❌ $ServiceName failed to start" -ForegroundColor Red
        Write-Host "Check logs with: docker-compose -f infra/docker-compose.dev.yml logs $ServiceName"
    }
}

Test-Service "postgres"
Test-Service "redis"
Test-Service "ipfs"
Test-Service "opensearch"

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now start the development server with:" -ForegroundColor White
Write-Host "  pnpm dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Available services:" -ForegroundColor White
Write-Host "  📱 Web App:     http://localhost:5173"
Write-Host "  🔧 API:         http://localhost:3333"
Write-Host "  💾 Database UI: http://localhost:8081"
Write-Host "  🌐 IPFS:        http://localhost:8080"
Write-Host "  🔍 OpenSearch:  http://localhost:9200"
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green