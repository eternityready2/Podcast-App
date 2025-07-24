"use client";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function PageHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("overflow_hidden");
    } else {
      document.body.classList.remove("overflow_hidden");
    }
  }, [isMenuOpen]);

  return (
    <header>
      <div id="main_header" className="free-container">
        <div className="logo">
          <Image
            onClick={() =>
              window.open("https://www.eternityready.com", "_self")
            }
            src="/logo1USE-THIS.png"
            alt="logo"
            width={420}
            height={140}
          />
          {!isHome && (
            <Link href={"/"} className="homeButton">
              <FontAwesomeIcon icon={faAngleLeft} />
              <p>Back</p>
            </Link>
          )}
        </div>

        <div className="centered_menu">
          <ul className="nav-links">
            <li className="has-arrow">
              <span>On-Demand</span>
              <div className="icon">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-icon="angle-down"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"
                  ></path>
                </svg>
              </div>
              <div className="submenu">
                <ul className="on-demand-dropdown">
                  <div className="dropdown-section">
                    <li>
                      <a href="https://www.eternityready.com/category.php">
                        Browse Categories
                      </a>
                    </li>
                    <li>
                      <a href="https://www.eternityready.com/newvideos.php">
                        New
                      </a>
                    </li>
                    <li>
                      <a href="https://www.eternityready.com/topvideos.php">
                        Popular
                      </a>
                    </li>
                  </div>
                </ul>
              </div>
            </li>
            <li>
              <a href="https://www.eternityready.com/radio">Music & Podcasts</a>
            </li>
            <li className="has-arrow">
              <a href="https://tv.eternityready.com/">TV Channels & Movies</a>
            </li>
            <li>
              <a href="https://www.eternityready.com/page.php?p=9">
                <span>Affiliates</span>
              </a>
            </li>
            <li className="has-arrow">
              <span>About us</span>
              <div className="icon">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-icon="angle-down"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"
                  ></path>
                </svg>
              </div>
              <div className="submenu">
                <ul className="about-us-dropdown">
                  <li>
                    <a href="https://eternityready.com/donate">Donate</a>
                  </li>
                  <li>
                    <a href="https://help.eternityready.com/">
                      Contact &amp; Help
                    </a>
                  </li>
                  <li>
                    <a href="#">Mission, Beliefs</a>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
        <div className="right">
          <button
            onClick={() =>
              window.open("https://eternityreadyradio.com/", "_self")
            }
          >
            Radio
          </button>
          <div id="burger_menu" onClick={toggleMenu}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="35"
              height="35"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
          </div>
        </div>
      </div>
      <div
        id="side_menu"
        className={`free-container ${isMenuOpen ? "open" : ""}`}
      >
        <div className="bar">
          <div className="inner">
            <div className="top">
              <h2>Menu</h2>
              <button id="side_menu_close_button" onClick={toggleMenu}>
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="xmark"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 384 512"
                >
                  <path
                    fill="currentColor"
                    d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                  ></path>
                </svg>
              </button>
            </div>
            <ul>
              <li className="item menuButton">
                <a href="https://www.eternityready.com/donate" target="_self">
                  Donate
                </a>
              </li>
              <li className="item">
                <a href="https://www.eternityready.com/radio" target="_self">
                  Music & Radio
                </a>
              </li>
              <li className="item">
                <a href="https://podcasts.eternityready.com/" target="_self">
                  Podcasts
                </a>
              </li>
              <li className="item">
                <a href="https://tv.eternityready.com/" target="__self">
                  TV & Movies
                </a>
              </li>
              <li className="item dropdown">
                <a href="#" id="dropdown-btn" target="_self">
                  More Options &#9662;
                </a>
                <ul className="dropdown-content" id="dropdown-menu">
                  <li>
                    <a href="/link-submenu-1">Sub-item 1</a>
                  </li>
                  <li>
                    <a href="/link-submenu-2">Sub-item 2</a>
                  </li>
                  <li>
                    <a href="/link-submenu-3">Sub-item 3</a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div id="mobile_fixed_menu" className="free-container">
        <div className="inner">
          <button
            className="item"
            tabIndex={0}
            onClick={() =>
              window.open("https://www.eternityready.com/", "_self")
            }
          >
            <div className="icon">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 576 512"
                height="24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z"></path>
              </svg>
            </div>
            <div className="text">Home</div>
          </button>
          <button
            className="item"
            tabIndex={0}
            onClick={() =>
              window.open("https://tv.eternityready.com/", "_self")
            }
          >
            <div className="icon">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 512 512"
                height="24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M488 64h-8v20c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12V64H96v20c0 6.6-5.4 12-12 12H44c-6.6 0-12-5.4-12-12V64h-8C10.7 64 0 74.7 0 88v336c0 13.3 10.7 24 24 24h8v-20c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v20h320v-20c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v20h8c13.3 0 24-10.7 24-24V88c0-13.3-10.7-24-24-24zM96 372c0 6.6-5.4 12-12 12H44c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm0-96c0 6.6-5.4 12-12 12H44c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm0-96c0 6.6-5.4 12-12 12H44c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm272 208c0 6.6-5.4 12-12 12H156c-6.6 0-12-5.4-12-12v-96c0-6.6 5.4-12 12-12h200c6.6 0 12 5.4 12 12v96zm0-168c0 6.6-5.4 12-12 12H156c-6.6 0-12-5.4-12-12v-96c0-6.6 5.4-12 12-12h200c6.6 0 12 5.4 12 12v96zm112 152c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm0-96c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40zm0-96c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40z"></path>
              </svg>
            </div>
            <div className="text">Movies</div>
          </button>
          <button
            className="item"
            tabIndex={0}
            onClick={() =>
              window.open("https://www.eternityready.com/series.php", "_self")
            }
          >
            <div className="icon">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 640 512"
                height="24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M592 0H48A48 48 0 0 0 0 48v320a48 48 0 0 0 48 48h240v32H112a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16H352v-32h240a48 48 0 0 0 48-48V48a48 48 0 0 0-48-48zm-16 352H64V64h512z"></path>
              </svg>
            </div>
            <div className="text">Series</div>
          </button>
          <button
            className="item selected"
            tabIndex={0}
            onClick={() =>
              window.open("https://podcasts.eternityready.com/", "_self")
            }
          >
            <div className="icon">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 448 512"
                height="24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M267.429 488.563C262.286 507.573 242.858 512 224 512c-18.857 0-38.286-4.427-43.428-23.437C172.927 460.134 160 388.898 160 355.75c0-35.156 31.142-43.75 64-43.75s64 8.594 64 43.75c0 32.949-12.871 104.179-20.571 132.813zM156.867 288.554c-18.693-18.308-29.958-44.173-28.784-72.599 2.054-49.724 42.395-89.956 92.124-91.881C274.862 121.958 320 165.807 320 220c0 26.827-11.064 51.116-28.866 68.552-2.675 2.62-2.401 6.986.628 9.187 9.312 6.765 16.46 15.343 21.234 25.363 1.741 3.654 6.497 4.66 9.449 1.891 28.826-27.043 46.553-65.783 45.511-108.565-1.855-76.206-63.595-138.208-139.793-140.369C146.869 73.753 80 139.215 80 220c0 41.361 17.532 78.7 45.55 104.989 2.953 2.771 7.711 1.77 9.453-1.887 4.774-10.021 11.923-18.598 21.235-25.363 3.029-2.2 3.304-6.566.629-9.185zM224 0C100.204 0 0 100.185 0 224c0 89.992 52.602 165.647 125.739 201.408 4.333 2.118 9.267-1.544 8.535-6.31-2.382-15.512-4.342-30.946-5.406-44.339-.146-1.836-1.149-3.486-2.678-4.512-47.4-31.806-78.564-86.016-78.187-147.347.592-96.237 79.29-174.648 175.529-174.899C320.793 47.747 400 126.797 400 224c0 61.932-32.158 116.49-80.65 147.867-.999 14.037-3.069 30.588-5.624 47.23-.732 4.767 4.203 8.429 8.535 6.31C395.227 389.727 448 314.187 448 224 448 100.205 347.815 0 224 0zm0 160c-35.346 0-64 28.654-64 64s28.654 64 64 64 64-28.654 64-64-28.654-64-64-64z"></path>
              </svg>
            </div>
            <div className="text">Podcast</div>
          </button>
          <button
            className="item"
            tabIndex={0}
            onClick={() =>
              window.open("https://www.eternityready.com/radio", "_self")
            }
          >
            <div className="icon">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 512 512"
                height="24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M494.8 47c12.7-3.7 20-17.1 16.3-29.8S494-2.8 481.2 1L51.7 126.9c-9.4 2.7-17.9 7.3-25.1 13.2C10.5 151.7 0 170.6 0 192l0 4L0 304 0 448c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64l-229.5 0L494.8 47zM368 240a80 80 0 1 1 0 160 80 80 0 1 1 0-160zM80 256c0-8.8 7.2-16 16-16l96 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-96 0c-8.8 0-16-7.2-16-16zM64 320c0-8.8 7.2-16 16-16l128 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L80 336c-8.8 0-16-7.2-16-16zm16 64c0-8.8 7.2-16 16-16l96 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-96 0c-8.8 0-16-7.2-16-16z"></path>
              </svg>
            </div>
            <div className="text">Radio</div>
          </button>
        </div>
      </div>
    </header>
  );
}
