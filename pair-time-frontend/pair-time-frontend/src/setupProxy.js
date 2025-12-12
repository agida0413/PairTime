const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // OAuth2 요청을 백엔드로 프록시 (Same-Origin으로 만들기)
  app.use(
    '/oauth2',
    createProxyMiddleware({
      target: 'http://localhost:80',
      changeOrigin: true,
      cookieDomainRewrite: 'localhost',
      onProxyReq: (proxyReq, req, res) => {
        console.log('🔄 Proxying OAuth2 request:', req.url);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('✅ OAuth2 response received');
        // 쿠키 헤더 수정 (SameSite 추가)
        const setCookie = proxyRes.headers['set-cookie'];
        if (setCookie) {
          proxyRes.headers['set-cookie'] = setCookie.map(cookie => {
            // SameSite=Lax 추가 (사파리 호환)
            if (!cookie.includes('SameSite')) {
              return cookie + '; SameSite=Lax';
            }
            return cookie;
          });
        }
      }
    })
  );

  // API 요청을 백엔드로 프록시
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:80',
      changeOrigin: true,
      cookieDomainRewrite: 'localhost',
      onProxyReq: (proxyReq, req, res) => {
        console.log('🔄 Proxying API request:', req.url);
      }
    })
  );
};
