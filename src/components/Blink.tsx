import styled from 'styled-components';

export const Blink = styled.span`
  animation: blinker 1s linear infinite;
  @keyframes blinker {
    50% {
      opacity: 0;
    }
  }
`;
