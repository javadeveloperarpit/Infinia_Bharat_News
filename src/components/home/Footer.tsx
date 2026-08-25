import Image from "next/image";
import Link from "next/link";

import {
  FaInstagram,
  FaYoutube,
  FaFacebookF,
  FaEnvelope,
  FaLocationDot,
} from "react-icons/fa6";

import {
  getCategories,
} from "@/services/public/category.public.service";


export default async function Footer() {

  const categories = await getCategories();

  return (

    <footer
      className="
        bg-[#090909]
        border-t
        border-[#ECCA6D]/20
        text-white
      "
    >

      <div
        className="
          container-news
          py-12
        "
      >

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-4
            gap-10
          "
        >


          {/* BRAND */}

          <div>

            <Image
              src="/logo.webp"
              alt="INFINIA Bharat News"
              width={220}
              height={70}
              className="
                w-[200px]
                mb-5
              "
            />

            <p
              className="
                text-zinc-300
                text-sm
                leading-6
              "
            >
              INFINIA BHARAT NEWS delivers breaking news,
              India news, world news, politics, technology,
              entertainment and latest updates.
            </p>

          </div>


          {/* QUICK LINKS */}

          <div>

            <h3
              className="
                text-lg
                font-black
                mb-5
                text-[#ECCA6D]
              "
            >
              Quick Links
            </h3>

            <div
              className="
                flex
                flex-col
                gap-3
                text-sm
                text-zinc-300
              "
            >

              <Link
                href="/"
                className="hover:text-white transition"
              >
                Home
              </Link>

              <Link
                href="/latest"
                className="hover:text-white transition"
              >
                Latest News
              </Link>

              <Link
                href="/video"
                className="hover:text-white transition"
              >
                Videos
              </Link>

              <Link
                href="/reels"
                className="hover:text-white transition"
              >
                Reels
              </Link>

              <Link
                href="/about"
                className="hover:text-white transition"
              >
                About Us
              </Link>

              <Link
                href="/author"
                className="hover:text-white transition"
              >
                Authors Page
              </Link>

              <Link
                href="/privacy-policy"
                className="hover:text-white transition"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="hover:text-white transition"
              >
                Terms of Condition
              </Link>

              <Link
                href="/contact"
                className="hover:text-white transition"
              >
                Contact Us
              </Link>

              <Link
                href="/advertise"
                className="hover:text-white transition"
              >
                Advertise
              </Link>

              <Link
                href="/live-tv"
                className="hover:text-white transition"
              >
                Live TV
              </Link>

            </div>

          </div>


          {/* CATEGORIES */}

          <div>

            <h3
              className="
                text-lg
                font-black
                mb-5
                text-[#ECCA6D]
              "
            >
              Categories
            </h3>

            <div
              className="
                flex
                flex-col
                gap-3
                text-sm
                text-zinc-300
              "
            >

              {
                categories.map((category: any) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="
                      hover:text-white
                      transition
                    "
                  >
                    {category.name}
                  </Link>
                ))
              }

            </div>

          </div>


          {/* CONTACT & SOCIAL */}

          <div>

            <h3
              className="
                text-lg
                font-black
                mb-5
                text-[#ECCA6D]
              "
            >
              Connect With Us
            </h3>


            {/* CONTACT INFORMATION */}

            <div
              className="
                flex
                flex-col
                gap-4
                mb-7
                text-sm
              "
            >

              {/* EMAIL */}

              <div className="flex gap-3 items-start">

                <div
                  className="
                    w-9
                    h-9
                    shrink-0
                    rounded-lg
                    bg-[#ECCA6D]/10
                    border
                    border-[#ECCA6D]/20
                    flex
                    items-center
                    justify-center
                    text-[#ECCA6D]
                  "
                >
                  <FaEnvelope size={16} />
                </div>

                <div className="min-w-0">

                  <p className="text-zinc-500 text-xs mb-1">
                    Email Us
                  </p>

                  <a
                    href="mailto:contact.infiniabharatnews@gmail.com"
                    className="
                      text-zinc-200
                      hover:text-[#ECCA6D]
                      transition
                      break-all
                    "
                  >
                    contact.infiniabharatnews@gmail.com
                  </a>

                </div>

              </div>


              {/* ADDRESS */}

              <div className="flex gap-3 items-start">

                <div
                  className="
                    w-9
                    h-9
                    shrink-0
                    rounded-lg
                    bg-[#ECCA6D]/10
                    border
                    border-[#ECCA6D]/20
                    flex
                    items-center
                    justify-center
                    text-[#ECCA6D]
                  "
                >
                  <FaLocationDot size={16} />
                </div>

                <div>

                  <p className="text-zinc-500 text-xs mb-1">
                    Our Location
                  </p>

                  <address className="not-italic text-zinc-200 leading-6">

                    Lucknow, Uttar Pradesh,
                    <br />

                    India – 226020

                  </address>

                </div>

              </div>

            </div>


            {/* SOCIAL MEDIA */}

            <div>

              <p
                className="
                  text-xs
                  text-zinc-500
                  uppercase
                  tracking-wider
                  mb-3
                "
              >
                Follow INFINIA BHARAT NEWS
              </p>


              <div
                className="
                  flex
                  gap-4
                "
              >

                <a
                  href="https://www.instagram.com/infiniabharatnews"
                  target="_blank"
                  aria-label="Follow INFINIA BHARAT NEWS on Instagram"
                  rel="noopener noreferrer"
                  className="
                    w-11
                    h-11
                    rounded-full
                    bg-white/5
                    border
                    border-white/10
                    flex
                    items-center
                    justify-center
                    hover:border-pink-500
                    hover:text-pink-500
                    transition
                  "
                >
                  <FaInstagram size={20} />
                </a>


                <a
                  href="https://www.youtube.com/@Infinia_Bharat_News"
                  target="_blank"
                  aria-label="Subscribe to INFINIA BHARAT NEWS on YouTube"
                  rel="noopener noreferrer"
                  className="
                    w-11
                    h-11
                    rounded-full
                    bg-white/5
                    border
                    border-white/10
                    flex
                    items-center
                    justify-center
                    hover:border-red-500
                    hover:text-red-500
                    transition
                  "
                >
                  <FaYoutube size={20} />
                </a>


                <a
                  href="https://www.facebook.com/InfiniaBharatNews"
                  target="_blank"
                  aria-label="Follow INFINIA BHARAT NEWS on Facebook"
                  rel="noopener noreferrer"
                  className="
                    w-11
                    h-11
                    rounded-full
                    bg-white/5
                    border
                    border-white/10
                    flex
                    items-center
                    justify-center
                    hover:border-blue-500
                    hover:text-blue-500
                    transition
                  "
                >
                  <FaFacebookF size={20} />
                </a>

              </div>

            </div>

          </div>

        </div>


        {/* BOTTOM */}

        <div
          className="
            mt-10
            pt-6
            border-t
            border-white/10
            text-center
            text-sm
            text-zinc-300
          "
        >

          © {new Date().getFullYear()} INFINIA BHARAT NEWS. All Rights Reserved.

        </div>

      </div>

    </footer>

  );

}