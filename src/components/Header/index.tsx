import Link from 'next/link';
import styles from './header.module.scss';

interface Props {
  isHome: boolean;
}

export default function Header({ isHome }: Props): JSX.Element {
  return (
    <header className={styles.header}>
      {isHome ? (
        <h1 title="Blog do Ignite" className={styles.home}>
          <img src="/img/logo.svg" alt="logo" />
        </h1>
      ) : (
        <Link href="/">
          <a>
            <img src="/img/logo.svg" alt="logo" className={styles.slug} />
          </a>
        </Link>
      )}
    </header>
  );
}
