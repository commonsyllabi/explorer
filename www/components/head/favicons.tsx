import * as React from "react";

interface IFaviconsProps {}

const Favicons: React.FunctionComponent<IFaviconsProps> = (props) => {
  return (
    <>
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/common-syllabi-favicon_32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="128x128"
        href="/common-syllabi-favicon_128.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="180x180"
        href="/common-syllabi-favicon_180.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="/common-syllabi-favicon_192.png"
      />
      <link rel="icon" type="image/png" sizes="256x256" href="/favicon.ico" />
    </>
  );
};

export default Favicons;
