import { MdDateRange } from 'react-icons/md';
import { FiUser } from 'react-icons/fi';
import { GetStaticProps } from 'next/types';
import Link from 'next/link';
import Head from 'next/head';
import { useState } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [loadedPosts, setLoadedPosts] = useState([...postsPagination.results]);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [isLoading, setIsLoading] = useState(false);

  const updateDate: (date: string) => string = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy', {
      locale: ptBR,
    });
  };

  const loadMorePosts: () => void = async () => {
    setIsLoading(true);
    const morePosts = await fetch(nextPage)
      .then(r => r.json())
      .then(r => r);

    const nextPagePosts = morePosts.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setNextPage(morePosts.next_page);
    setLoadedPosts([...loadedPosts, ...nextPagePosts]);
    setIsLoading(false);
  };
  return (
    <>
      <Head>
        <title>Space Traveling Blog</title>
      </Head>
      <Header isHome />
      <main className={commonStyles.container}>
        <ul className={styles.posts}>
          {loadedPosts.map(post => (
            <li key={post.uid}>
              <Link href={`/post/${post.uid}`}>
                <a>
                  <h2>{post.data.title}</h2>
                </a>
              </Link>
              <p className={styles.excerpt}>{post.data.subtitle}</p>
              <div className={commonStyles.status}>
                <time>
                  <MdDateRange />
                  {updateDate(post.first_publication_date)}
                </time>
                <p>
                  <FiUser />
                  {post.data.author}
                </p>
              </div>
            </li>
          ))}
        </ul>
        {nextPage && (
          <button
            className={styles.button}
            type="button"
            onClick={loadMorePosts}
          >
            Carregar mais posts
          </button>
        )}
        {isLoading && <div className={commonStyles.loader} />}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post', {
    pageSize: 4,
  });

  const homePosts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: homePosts,
  };
  return {
    props: { postsPagination },
    revalidate: 60 * 60 * 24,
  };
};
