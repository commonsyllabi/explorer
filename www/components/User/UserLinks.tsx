import * as React from "react";
import Link from "next/link";

interface IUserLinksProps {
  links: string[];
}

const UserLinks: React.FunctionComponent<IUserLinksProps> = ({ links }) => {
  if (links.length < 1) {
    return null;
  }
  const userLinksEls = links.map((link) => (
    <li key={link}>
      <Link href={link}>
        <a target="_blank" rel="noreferrer">
          {link}
        </a>
      </Link>
    </li>
  ));
  return <ul className="list-unstyled">{userLinksEls}</ul>;
};

export default UserLinks;
