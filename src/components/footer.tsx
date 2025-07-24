"use client";
import {
  faFacebook,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

export default function PageFooter() {
  return (
    <footer>
      <div className="container">
        <div className="social-section">
          <h2 className="main-title">Connect with us</h2>

          <div className="social-links">
            <div className="social-row">
              <a
                className="social-btn facebook-btn"
                href="https://www.facebook.com/eternityready"
                target="_blank"
              >
                <FontAwesomeIcon icon={faFacebook} size="1x" />
                Facebook
              </a>
              <a className="social-btn twitter-btn" href="#" target="_blank">
                <Image src="/x-icon.svg" alt="X Logo" width={14} height={14} />
                x.com
              </a>
            </div>
            <div className="social-row">
              <a className="social-btn youtube-btn" href="#" target="_blank">
                <FontAwesomeIcon icon={faYoutube} size="1x" color="#E1306C" />
                YouTube
              </a>

              <a
                className="social-btn instagram-btn"
                href="https://www.instagram.com/jeremiahfarris/"
                target="_blank"
              >
                <FontAwesomeIcon icon={faInstagram} size="1x" color="#E1306C" />
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="divider"></div>
        <div className="app-wrap">
          <div className="our-apps">
            <h4>Our Apps</h4>

            <a
              href="https://play.google.com/store/apps/details?id=com.wEternityReadyRadio&amp;hl=en_US&amp;gl=US"
              target="_blank"
            >
              <Image src="/gp.png" alt="Google Play" width={309} height={89} />
            </a>
            <a
              href="https://apps.apple.com/us/app/rapture-ready/id6504677632"
              target="_blank"
            >
              <Image
                src="/app-store.png"
                alt="App Store"
                width={300}
                height={88}
              />
            </a>
          </div>
          <div className="f-r-container">
            <div className="row">
              <div className="useful-links f-wd">
                <h4>Useful Links</h4>
                <ul>
                  <li
                    onClick={() =>
                      window.open(
                        "https://www.eternityreadyradio.com/",
                        "_self"
                      )
                    }
                  >
                    Radio Schedule
                  </li>
                  <li
                    onClick={() =>
                      window.open(
                        "https://www.eternityready.com/page.php?p=11",
                        "_self"
                      )
                    }
                  >
                    Ways to Listen
                  </li>
                  <li
                    onClick={() =>
                      window.open(
                        "https://www.eternityready.com/donate",
                        "_self"
                      )
                    }
                  >
                    Donate
                  </li>
                </ul>
              </div>
              <div className="our-brands f-wd">
                <h4>Our Brands</h4>
                <ul>
                  <li
                    onClick={() =>
                      window.open("https://www.eternityready.com/", "_self")
                    }
                  >
                    Corporate
                  </li>
                  <li
                    onClick={() =>
                      window.open("http://www.eternityready.tv/", "_self")
                    }
                  >
                    Eternity Ready TV
                  </li>
                  <li
                    onClick={() =>
                      window.open("http://www.raptureready.tv/", "_self")
                    }
                  >
                    Rapture Ready TV
                  </li>
                </ul>
              </div>
            </div>

            <div className="row">
              <div className="f-wd">
                <h4>About</h4>
                <ul>
                  <li
                    onClick={() =>
                      window.open("https://eternityready.com/help/", "_self")
                    }
                  >
                    Team & Culture
                  </li>
                  <li
                    onClick={() =>
                      window.open("https://eternityready.com/about-us", "_self")
                    }
                  >
                    About Us
                  </li>
                  <li
                    onClick={() =>
                      window.open(
                        "https://www.eternityready.com/EternityReadyMedia.pdf",
                        "_self"
                      )
                    }
                  >
                    Our Media Kit
                  </li>
                </ul>
              </div>
              <div className="f-wd">
                <h4>Help</h4>
                <ul>
                  <li
                    onClick={() =>
                      window.open(
                        "https://eternityready.com/page.php?p=1",
                        "_self"
                      )
                    }
                  >
                    Terms of use
                  </li>
                  <li
                    onClick={() =>
                      window.open(
                        "https://www.eternityready.com/page.php?p=7",
                        "_self"
                      )
                    }
                  >
                    Privacy & Legal
                  </li>
                  <li
                    onClick={() =>
                      window.open("https://help.eternityready.com/", "_self")
                    }
                  >
                    Contact & Help
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="brand-logo">
            ETERNITY
            <span>READY</span>
          </div>
          <div className="copyright">
            © 2012-2025 Eternity Ready LLC, All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
