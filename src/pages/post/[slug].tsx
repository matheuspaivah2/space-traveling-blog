import { RichText } from 'prismic-dom';
import { GetStaticPaths, GetStaticProps } from 'next/types';
import { MdDateRange } from 'react-icons/md';
import { FiUser } from 'react-icons/fi';
import { AiOutlineClockCircle } from 'react-icons/ai';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  readingTime: number;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

interface ContentProps {
  heading: string;
  body: {
    text: string;
  }[];
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const readingTime = post.data.content.reduce(
    (previousValue: number, currentValue: ContentProps) =>
      previousValue + RichText.asText(currentValue.body).split(' ').length,
    0
  );

  const blogPost = {
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    readingTime: Math.ceil(readingTime / 200),
    data: {
      title: post.data.title,
      banner: {
        url: post.data.banner.url,
      },
      author: post.data.author,
      content: [...post.data.content],
    },
  };
  return (
    <>
      <Head>
        <title>{blogPost.data.title}</title>
      </Head>
      <Header isHome={false} />
      <img src={blogPost.data.banner.url} alt="" className={styles.banner} />
      <main className={commonStyles.container}>
        <h1>{blogPost.data.title}</h1>
        <div className={commonStyles.status}>
          <time>
            {' '}
            <MdDateRange />
            {blogPost.first_publication_date}
          </time>
          <p>
            {' '}
            <FiUser />
            {blogPost.data.author}
          </p>
          <span>
            <AiOutlineClockCircle />
            {blogPost.readingTime} min
          </span>
        </div>
        <article className={styles.article}>
          {blogPost.data.content.map(block => (
            <div key={`${block}`}>
              <h2>{block.heading}</h2>
              <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(block.body),
                }}
              />
            </div>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post');
  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('post', String(slug));

  return {
    props: { post: response },
  };
};
