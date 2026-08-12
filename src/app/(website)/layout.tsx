import TopBar from "@/components/home/top-bar";
import MainHeader from "@/components/home/main-header";
import BreakingNews from "@/components/home/breaking-news";
import Navbar from "@/components/home/navbar";
import Footer from "@/components/home/Footer";
import GlobalAds from "@/components/ads/GlobalAds";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopBar />

      <MainHeader />

      <BreakingNews />

      <Navbar />

      {children}
      <GlobalAds />
      
      <Footer />
    </>
  );
}