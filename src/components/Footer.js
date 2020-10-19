import React from 'react';

import { linkHover } from '../themes';

const Footer = ({ className }) => {
  return (
    <div
      className={`pb-8 text-center w-full bottom-0 text-gray-800 dark:text-gray-200 ${className}`}
      style={{ zIndex: -1 }}
    >
      Made by{' '}
      <a
        className={`underline ${linkHover}`}
        href="https://kevinhu.io"
        target="_blank"
        rel="noopener noreferrer"
      >
        Kevin Hu
      </a>{' '}
      and{' '}
      <a
        className={`underline ${linkHover}`}
        href="https://taehyoungjo.github.io/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Tae Hyoung Jo
      </a>
      <br />
      <a
        className={`underline ${linkHover}`}
        href="https://github.com/kevinhu/hotpot"
        target="_blank"
        rel="noopener noreferrer"
      >
        Source
      </a>{' '}
      on GitHub
    </div>
  );
};

export default Footer;
