import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { a } from 'react-spring'
import InfiniteCarousel from './Slider'
import items from './items'
import './styles.css'

const Main = styled.div`
  height: 100vh;
  margin: 0 auto;
`

const Content = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const Image = styled(a.div)`
  width: 100%;
  height: 100%;
  background-size: 400px;
  background-repeat: no-repeat;
  background-position: center center;
`

const MessageContainer = styled.div`
  margin-bottom: 80px;
  color: #fff;
  width: 100%;
`
const Message = styled.div`
  text-align: center;
`

ReactDOM.render(
  <Main>
    <InfiniteCarousel items={items} itemWidth={'full'} visible={1}>
      {({ css, message }, i) => (
        <Content>
          <Image style={{ backgroundImage: css }} />
          <MessageContainer>
            <Message dangerouslySetInnerHTML={{ __html: message }} />
          </MessageContainer>
        </Content>
      )}
    </InfiniteCarousel>
  </Main>,
  document.getElementById('root')
)
