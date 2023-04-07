import * as React from "react";
import Link from "next/link";

interface IUserLinksProps {
  links: string[] | undefined,
  isAdmin: boolean,
  apiUrl: string,
}

const UserLinks: React.FunctionComponent<IUserLinksProps> = ({ links, isAdmin, apiUrl }) => {
  if (!links || links.length === 0) {
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
  return (
    <div id="user-links">
      <ul className="list-unstyled">{userLinksEls}</ul>
    </div>
  );
};

export default UserLinks;
