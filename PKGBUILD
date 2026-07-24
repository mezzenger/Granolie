pkgname=granolie
pkgver=0.1.0
pkgrel=41
pkgdesc="Linux-first local AI meeting notes app with transcription and structured summaries"
arch=('x86_64')
url='https://github.com/mezzenger/Granolie'
license=('custom:UNLICENSED')
depends=(
  'at-spi2-core'
  'gtk3'
  'libnotify'
  'libsecret'
  'libxss'
  'libxtst'
  'nss'
  'xdg-utils'
)
optdepends=(
  'libappindicator-gtk3: tray integration support'
  'python: local faster-whisper transcription runtime and LibreOffice Writer integration'
  'uv: on-demand bootstrap for the local faster-whisper helper'
)
options=(!strip !debug)
source=()
sha256sums=()

package() {
  local bundle_dir="${startdir}/dist/linux-unpacked"
  local icons_dir="${startdir}/build/icons"
  local desktop_file="${startdir}/packaging/arch/granolie.desktop"

  if [[ ! -d "${bundle_dir}" ]]; then
    error "Missing ${bundle_dir}. Run 'npm run package' first."
    return 1
  fi

  if [[ ! -d "${icons_dir}" ]]; then
    error "Missing ${icons_dir}. Packaging icons have not been generated."
    return 1
  fi

  if [[ ! -f "${desktop_file}" ]]; then
    error "Missing ${desktop_file}."
    return 1
  fi

  install -d "${pkgdir}/opt/Granolie"
  install -d "${pkgdir}/usr/bin"
  cp -a --no-preserve=ownership "${bundle_dir}/." "${pkgdir}/opt/Granolie/"

  chmod 4755 "${pkgdir}/opt/Granolie/chrome-sandbox"
  ln -sf '/opt/Granolie/granolie' "${pkgdir}/usr/bin/granolie"

  install -Dm644 "${desktop_file}" "${pkgdir}/usr/share/applications/granolie.desktop"

  install -Dm644 "${icons_dir}/32x32.png" "${pkgdir}/usr/share/icons/hicolor/32x32/apps/granolie.png"
  install -Dm644 "${icons_dir}/64x64.png" "${pkgdir}/usr/share/icons/hicolor/64x64/apps/granolie.png"
  install -Dm644 "${icons_dir}/128x128.png" "${pkgdir}/usr/share/icons/hicolor/128x128/apps/granolie.png"
  install -Dm644 "${icons_dir}/256x256.png" "${pkgdir}/usr/share/icons/hicolor/256x256/apps/granolie.png"
  install -Dm644 "${icons_dir}/512x512.png" "${pkgdir}/usr/share/icons/hicolor/512x512/apps/granolie.png"
  install -Dm644 "${icons_dir}/1024x1024.png" "${pkgdir}/usr/share/icons/hicolor/1024x1024/apps/granolie.png"
}
