import { useEffect, useState } from 'react';
import styles from './BeerLoader.module.css';

const BeerLoader = ({ onLoadingComplete, isReady = false, error = null }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isReady && !error) return;

    if (error) {
      setTimeout(() => {
        setIsVisible(false);
        if (onLoadingComplete) {
          onLoadingComplete();
        }
      }, 1500);
      return;
    }

    setTimeout(() => {
      setIsVisible(false);
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 500);
  }, [onLoadingComplete, isReady, error]);

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.beerLoader}>
        {error ? (
          <div className={styles.errorMessage}>
            <p>ネットワークエラー</p>
            <p>インターネット接続を確認してください</p>
          </div>
        ) : (
          <div className={styles.mug}>
            <div className={styles.liquid}></div>
            <div className={styles.foam}></div>
            <div className={styles.handle}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeerLoader;
