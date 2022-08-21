import * as React from "react";
import Link from "next/link";

interface ILinkItem {
  uuid: string;
  title: string;
  url: string;
}

interface IUserListingsSectionProps {
  sectionTitle: string;
  sectionContents: ILinkItem[];
  sectionPrivateContents: ILinkItem[];
}

const UserListingsSection: React.FunctionComponent<
  IUserListingsSectionProps
> = ({ sectionTitle, sectionContents, sectionPrivateContents }) => {
  const linkEls = sectionContents.map((linkItem) => (
    <li key={linkItem.uuid}>
      <Link href={linkItem.url}>
        <a>{linkItem.title}</a>
      </Link>
    </li>
  ));

  const privateLinkEls = sectionPrivateContents.map((linkItem) => (
    <li key={linkItem.uuid}>
      <Link href={linkItem.url}>
        <a>{linkItem.title}</a>
      </Link>
    </li>
  ));

  return (
    <div id="user-syllabi-index" className="py4 mb-5 border-bottom">
      <h2>{sectionTitle}</h2>
      {/* TODO: Make public view */}
      <div id="user-syllabi-index-public">
        <h3 className="h6">
          Your {sectionTitle}
          <span className="badge bg-success ms-2">Public</span>
        </h3>
        {linkEls.length > 0 ? (
          <ul className="list-unstyled pb-3">{linkEls}</ul>
        ) : (
          <p className="notice-empty text-muted pb-3">
            <em>No {sectionTitle.toLowerCase()}.</em>
          </p>
        )}
      </div>
      <div id="user-syllabi-index-private">
        <h3 className="h6">
          Your {sectionTitle}
          <span className="badge bg-secondary ms-2">Private</span>
        </h3>
        {privateLinkEls.length > 0 ? (
          <ul className="list-unstyled pb-3">{privateLinkEls}</ul>
        ) : (
          <p className="notice-empty text-muted pb-3">
            <em>No {sectionTitle.toLowerCase()}.</em>
          </p>
        )}
      </div>
    </div>
  );
};

export default UserListingsSection;