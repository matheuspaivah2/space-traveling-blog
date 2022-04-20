import { MdDateRange } from 'react-icons/md';
import { FiUser } from 'react-icons/fi';
import { GetStaticProps } from 'next/types';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
  posts: PostPagination;
}

export default function Home({ posts }: HomeProps): JSX.Element {
  return (
    <>
      <main className={`${styles.container} ${commonStyles.maxWidth}`}>
        <h1 title="Blog do Ignite">
          <img src="/img/logo.svg" alt="Logo do Blog" />
        </h1>

        <ul className={styles.posts}>
          {posts.results.map(post => (
            <li key={post.uid}>
              <Link href={`/${post.uid}`}>
                <a>
                  <h2>{post.data.title}</h2>
                  <p>{post.data.subtitle}</p>
                  <div>
                    <time>
                      <MdDateRange />
                      {post.first_publication_date}
                    </time>
                    <p>
                      <FiUser />
                      {post.data.author}
                    </p>
                  </div>
                </a>
              </Link>
            </li>
          ))}
        </ul>
        <button className={styles.button} type="button">
          Carregar mais posts
        </button>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post');

  const homePosts = postsResponse.results.map(post => {
    const updateDate = new Date(post.first_publication_date).toLocaleDateString(
      'pt-Br',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    );
    return {
      uid: post.uid,
      first_publication_date: updateDate,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const posts = {
    next_page: postsResponse.next_page,
    results: homePosts,
  };
  return {
    props: { posts },
    revalidate: 60 * 60,
  };
};
