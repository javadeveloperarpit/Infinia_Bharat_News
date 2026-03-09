import '/Logo.css';
import logoImg from '../assets/finallogo.png';

export default function Logo() {

  return (
    <div className="flex items-center space-x-4 cursor-pointer">

      <div className="rotating-logo-container">
        <div className="rotating-logo-inner">
          <img
            src={logoImg}
            alt="Infinia Bharat News"
            className="rotating-logo-front"
          />
          <img
            src={logoImg}
            alt="Infinia Bharat News"
            className="rotating-logo-back"
          />
        </div>
      </div>

      <div className="block">
        <h1 className="text-xl md:text-3xl font-black tracking-tighter text-[#5C0611] uppercase ">
          Infinia <span className="text-[#5C0611]">भारत</span> NEWS
        </h1>

        <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 dark:text-zinc-400">
          Truth • Integrity • Excellence
        </p>
      </div>

    </div>
  );
}
