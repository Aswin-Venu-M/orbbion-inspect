import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Orbbion Inspect',
    short_name: 'Orbbion',
    description: 'Automotive Inspection & Quality Assurance',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#09090b',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '122x121',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
