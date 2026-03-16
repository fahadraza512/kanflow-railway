import withPWAInit from "next-pwa";

// Configure PWA
const withPWA = withPWAInit({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development' ? true : false, // Disable in dev, enable in production
    buildExcludes: [/middleware-manifest\.json$/],
    fallbacks: {
        document: "/offline.html",
    },
    // Workbox options
    runtimeCaching: [
        {
            urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                    maxEntries: 4,
                    maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
                }
            }
        },
        {
            urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: {
                    maxEntries: 4,
                    maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
                }
            }
        }
    ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // Optimize for faster builds
    swcMinify: true,
    productionBrowserSourceMaps: false,
    compress: true,
    // Disable static optimization for faster dev builds
    staticPageGenerationTimeout: 120,
    async rewrites() {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
        // Strip trailing /api/v1 if present — we append it in the destination
        const backendBase = backendUrl.replace(/\/api\/v1\/?$/, '');

        return [
            {
                source: '/api/v1/:path*',
                destination: `${backendBase}/api/v1/:path*`,
            },
        ];
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                ],
            },
        ];
    },
};

export default withPWA(nextConfig);
