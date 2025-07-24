import Image from "next/image";

export default function Salvation() {
  return (
    <div className="bottom_most_section free-container">
      <div className="content_wrapper">
        <div className="free-content">
          <h3>Are You Eternity Ready?</h3>
          <h4>If not learn how</h4>
          <a href="https://www.eternityready.com/salvation" className="button">
            Learn More
          </a>
        </div>
      </div>
      <div className="red_fitler"></div>
      <Image
        src="/if-not-1.webp"
        alt="Eternity Ready promotional content"
        width="1921"
        height="656"
      />
    </div>
  );
}
