import { useEffect } from "react";

export default function AdsenseAd() {

  useEffect(() => {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) {}
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-6155856047825271"
      data-ad-slot=""
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
