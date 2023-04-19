import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import Router, { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

import menuOpenIcon from '../../public/icons/menu-line.svg'
import menuCloseIcon from '../../public/icons/close-line.svg'
import logoImage from '../../public/cosyll_black_on_white.png'
import { useEffect, useState } from "react";
import { kurintoBook, kurintoSerif } from "app/layout";

const GlobalNav: React.FunctionComponent = () => {
  const { data: session, status } = useSession();
  const {pathname} = useRouter()
  const [isMenuDisplayed, setMenuDisplay] = useState(false)
  const toggleMenu = () => {
    setMenuDisplay(!isMenuDisplayed)
  }

  useEffect(() => {
    setMenuDisplay(false)
  }, [pathname])

  return (
    <div
      id="global-nav"
      className="flex flex-col justify-between border-b-2 border-b-gray-900 dark:border-b-gray-100 border-bottom"
    >
      <div className="flex w-full justify-between items-center p-3">
        <div className="flex gap-3">
          <Image src={logoImage} width="50" height="48" alt="Cosyll logo" />
          <div className="flex">
            <Link href="/">
              <div className={`${kurintoBook.className} text-2xl md:text-xl`}>Cosyll</div>
              <div className={`${kurintoSerif.className} hidden md:flex text-sm text-gray-600`}>Browse and publish Syllabi</div>
            </Link>
          </div>
        </div>

        {/* MOBILE */}
        <div onClick={toggleMenu} className="md:hidden cursor-pointer">
          {isMenuDisplayed ? <Image src={menuCloseIcon} width='24' height='24' alt='Icon to display the menu' /> :
            <Image src={menuOpenIcon} width='24' height='24' alt='Icon to display the menu' />}
        </div>

        {/* DESKTOP */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/new-syllabus"
            className="p-2 bg-gray-900 text-gray-100 border-2 rounded-md"
            data-cy="newSyllabusLink"
          >
            + New Syllabus
          </Link>

          <Link
            href="/about"
            className="mx-2 hover:underline"
            data-cy="aboutlink"
          >
            About
          </Link>

          {session ?
            <div
              className="mx-2 flex"
              data-cy="loggedUser"
            >
              <Link
                href={`/user/${session.user._id}`}
                className="py-2 mx-2 hover:underline"
                data-cy="accountLink"
              >
                My Account
              </Link>


              <Link
                href="#"
                className="py-2 mx-2 hover:underline"
                data-cy="signOut"
                onClick={() =>
                  signOut({ redirect: false }).then((result) => {
                    Router.push("/");
                  })
                }
              >
                Sign out
              </Link>
            </div>
            :
            <div className="mx-2">
              <Link href="/auth/signin" className="underline" data-cy="Login">
                Login
              </Link>
            </div>
          }
        </div>
      </div>

      {/* MOBILE MENU */}
      <div>
        {isMenuDisplayed ?
          <div className="flex flex-col items-end pb-3 mr-2 gap-3">
            <Link
              href="/new-syllabus"
              className="p-2 bg-gray-900 text-gray-100 border-2 rounded-md"
              data-cy="newSyllabusLink"
            >
              + New Syllabus
            </Link>

            <Link
              href="/about"
              className="mx-2"
              data-cy="aboutlink"
            >
              About
            </Link>

            {session ?
              <>
                <Link
                  href={`/user/${session.user._id}`}
                  className="p-2"
                  data-cy="accountLink"
                >
                  My Account
                </Link>

                <Link
                  href="#"
                  className="p-2"
                  data-cy="signOut"
                  onClick={() =>
                    signOut({ redirect: false }).then((result) => {
                      Router.push("/");
                    })
                  }
                >
                  Sign out
                </Link>
              </>
              :
              <div className="mx-2">
                <Link href="/auth/signin" className="underline">
                  Login
                </Link>
              </div>
            }
          </div>
          :
          <></>}
      </div>

    </div>
  );

};

export default GlobalNav;
