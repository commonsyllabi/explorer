import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Syllabi Explorer</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>Holler</h1>
    </div>
  );
};

export default Home;
