import * as React from "react";
import Link from "next/link";
import PubBadge from "components/PubBadge";

interface ILinkItem {
  uuid: string;
  title: string;
  url: string;
}

interface IUserListingsSectionProps {
  isAdmin: boolean;
  sectionTitle: string;
  sectionContents: ILinkItem[];
  sectionPrivateContents: ILinkItem[];
}

const UserListingsSection: React.FunctionComponent<
  IUserListingsSectionProps
> = ({ isAdmin, sectionTitle, sectionContents, sectionPrivateContents }) => {
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

  if (isAdmin === true) {
    return (
      <div id="user-syllabi-index" className="py4 mb-5 border-bottom">
        <h2>{sectionTitle}</h2>
        <div id="user-syllabi-index-public">
          <h3 className="h6">
            Your {sectionTitle}
            <PubBadge isPublic={true} />
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
            <PubBadge isPublic={false} />
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
  } else {
    return (
      <div id="user-syllabi-index" className="py4 mb-5 border-bottom">
        <h2>{sectionTitle}</h2>

        <div id="user-syllabi-index-public">
          {linkEls.length > 0 ? (
            <ul className="list-unstyled pb-3">{linkEls}</ul>
          ) : (
            <p className="notice-empty text-muted pb-3">
              <em>No {sectionTitle.toLowerCase()}.</em>
            </p>
          )}
        </div>
      </div>
    );
  }
};

export default UserListingsSection;
