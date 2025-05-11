document.addEventListener("DOMContentLoaded", function () {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(ipData => {
        const clientInfo = {
          ip: ipData.ip,
          city: ipData.city,
          region: ipData.region,
          country: ipData.country_name,
          org: ipData.org,
          userAgent: navigator.userAgent,
          language: navigator.language,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          screen: `${screen.width}x${screen.height}`,
          cpuCores: navigator.hardwareConcurrency,
          platform: navigator.platform,
          timestamp: new Date().toISOString()
        };
  
        fetch("/admin/client-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clientInfo)
        }).catch(err => {
          console.error("Client info gönderilemedi:", err);
        });
      });
  });
  