import { Tabs, Tab } from 'react-bootstrap';
import NFTApp from '../abis/NFTApp.json';
import Receiver from '../abis/Receiver.json';
import React, { Component } from 'react';
import Token from '../abis/Token.json';
import Web3 from 'web3';
import './App.css';

//h0m3w0rk - add new tab to check accrued interest

class App extends Component {
  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch);
  }

  async loadBlockchainData(dispatch) {
    if (typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum);
      const netId = await web3.eth.net.getId();
      const accounts = await web3.eth.getAccounts();

      if (typeof accounts[0] !== 'undefined') {
        const balance = await web3.eth.getBalance(accounts[0]);
        this.setState({ account: accounts[0], balance, web3 });
      } else window.alert('Please login with Metamask!');

      try {
        const token = new web3.eth.Contract(
          Token.abi,
          Token.networks[netId].address
        );
        const nftApp = new web3.eth.Contract(
          NFTApp.abi,
          NFTApp.networks[netId].address
        );
        const nftAppAddress = NFTApp.networks[netId].address;
        this.setState({
          token,
          nftApp,
          nftAppAddress,
        });
      } catch (e) {
        console.log('Error', e);
        window.alert('Contracts not deployed to the current network!');
      }
    } else window.alert('Please install Metamask!');
  }

  async mint(amount, link) {
    if (this.state.nftApp !== 'undefined') {
      try {
        const tokenId = await this.state.nftApp.methods
          .mint(link, amount.toString())
          .send({ from: this.state.account });
        window.alert(
          'Your NFT id is ' + tokenId.events.TokenMinted.returnValues['tokenId']
        );
      } catch (e) {
        console.log('Error, mint: ', e);
      }
    }
  }

  async getNFTInfo(tokenId) {
    if (this.state.nftApp !== 'undefined') {
      try {
        const tokenInfo = await this.state.nftApp.methods
          .getNFTInfo(tokenId)
          .call({ from: this.state.account });
        console.log(tokenInfo);
        this.setState({ NFT: tokenInfo });
        return tokenInfo;
      } catch (e) {
        console.log('Error, mint: ', e);
      }
    }
  }

  async buy(tokenId) {
    if (this.state.nftApp !== 'undefined') {
      try {
        const tokenInfo = await this.getNFTInfo(tokenId);
        await this.state.nftApp.methods
          .buy(tokenInfo['0'], this.state.account, tokenId)
          .send({ from: this.state.account, value: tokenInfo['1'] });
      } catch (e) {
        console.log('Error, buy: ', e);
      }
    }
  }

  async getBalance() {
    if (this.state.nftApp !== 'undefined') {
      try {
        const NFTBalance = await this.state.nftApp.methods
          .getBalance(this.state.account)
          .call({ from: this.state.account });
        this.setState({ NFTBalance });
      } catch (e) {
        console.log('Error, getBalance: ', e);
      }
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      nftApp: null,
      balance: 0,
      balanceInnftApp: null,
      interest: null,
      DBC: null,
      nftAppAddress: null,
      receiver: null,
      NFTBalance: null,
      NFT: null,
    };
  }

  render() {
    return (
      <div className="text-monospace">
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <b>nftApp</b>
          </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
          <br></br>
          <h1>Welcome to nftApp</h1>
          <h2>{this.state.account}</h2>
          <div className="d-flex flex-column justify-content-center align-items-center">
            <button
              className="btn btn-primary"
              onClick={() => this.getBalance()}
            >
              GET BNFT BALANCE
            </button>
            {this.state.NFTBalance
              ? 'You have ' + this.state.NFTBalance + ' NFT(s)'
              : ''}
          </div>

          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <Tabs defaultActiveKey="mint" id="uncontrolled-tab-example">
                  <Tab eventKey="mint" title="Mint">
                    <div>
                      <br />
                      Please enter the NFT information
                      <br />
                      <br />
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          let amount = this.price.value;
                          let link = this.link.value;
                          amount = amount * 10 ** 18;
                          this.mint(amount, link);
                        }}
                      >
                        <div className="form-group mr-sm-2">
                          <br />
                          <input
                            id="price"
                            step="0.01"
                            type="number"
                            className="form-control form-control-md"
                            placeholder="Price"
                            required
                            ref={(input) => (this.price = input)}
                          />
                          <input
                            id="link"
                            type="text"
                            className="form-control form-control-md"
                            placeholder="Link"
                            required
                            ref={(input) => (this.link = input)}
                          />
                        </div>
                        <button type="submit" className="btn btn-primary">
                          Mint
                        </button>
                      </form>
                    </div>
                  </Tab>
                  <Tab eventKey="getNFTInfo" title="Get NFT Info">
                    <div>
                      <br />
                      Please enter the ID of the NFT
                      <br />
                      <br />
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          let tokenId = this.tokenId.value;
                          this.getNFTInfo(tokenId);
                        }}
                      >
                        <div className="form-group mr-sm-2">
                          <br />
                          <input
                            id="tokenId"
                            step="0.01"
                            type="number"
                            className="form-control form-control-md"
                            placeholder="NFT ID"
                            required
                            ref={(input) => (this.tokenId = input)}
                          />
                        </div>
                        <button type="submit" className="btn btn-primary">
                          Get Info
                        </button>
                        {this.state.NFT ? (
                          <div className="d-flex flex-column justify-content-center align-items-center pt-2">
                            <p>Owner: {this.state.NFT['0']}</p>
                            <p>
                              Price:{' '}
                              {this.state.web3.utils.fromWei(
                                this.state.NFT['1']
                              )}{' '}
                              ETH
                            </p>
                            <p className="word-break">
                              IPFS Link: {this.state.NFT['2']}
                            </p>
                            <button
                              type="submit"
                              className="btn btn-primary"
                              onClick={() => this.buy(this.state.NFT['3'])}
                            >
                              Buy
                            </button>
                          </div>
                        ) : (
                          ''
                        )}
                      </form>
                    </div>
                  </Tab>
                  {/*
                  <Tab eventKey="deposit" title="Deposit">
                    <div>
                      <br />
                      How much do you want to deposit?
                      <br />
                      (min. amount is 0.01 ETH)
                      <br />
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          let amount = this.depositAmount.value;
                          amount = amount * 10 ** 18;
                          this.deposit(amount);
                        }}
                      >
                        <div className="form-group mr-sm-2">
                          <br />
                          <input
                            id="depositAmount"
                            step="0.01"
                            type="number"
                            className="form-control form-control-md"
                            placeholder="amount..."
                            required
                            ref={(input) => (this.depositAmount = input)}
                          />
                        </div>
                        <button type="submit" className="btn btn-primary">
                          DEPOSIT
                        </button>
                      </form>
                    </div>
                  </Tab>
                  <Tab eventKey="withdraw" title="Withdraw">
                    <br />
                    Do you want to withdraw + take interest?
                    <br />
                    <div>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        onClick={(e) => this.withdraw(e)}
                      >
                        WITHDRAW
                      </button>
                    </div>
                  </Tab>
                  <Tab eventKey="borrow" title="Borrow">
                    <div>
                      <br></br>
                      Do you want to borrow tokens?
                      <br></br>
                      (You'll get 50% of collateral, in Tokens)
                      <br></br>
                      Type collateral amount (in ETH)
                      <br></br>
                      <br></br>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          let amount = this.borrowAmount.value;
                          amount = amount * 10 ** 18;
                          this.borrow(amount);
                        }}
                      >
                        <div className="form-group mr-sm-2">
                          <input
                            id="borrowAmount"
                            step="0.01"
                            type="number"
                            ref={(input) => {
                              this.borrowAmount = input;
                            }}
                            className="form-control form-control-md"
                            placeholder="amount..."
                            required
                          />
                        </div>
                        <button type="submit" className="btn btn-primary">
                          BORROW
                        </button>
                      </form>
                    </div>
                  </Tab>
                  <Tab eventKey="payOff" title="Payoff">
                    <div>
                      <br></br>
                      Do you want to payoff the loan?
                      <br></br>
                      (You'll receive your collateral - fee)
                      <br></br>
                      <br></br>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        onClick={(e) => this.payOff(e)}
                      >
                        PAYOFF
                      </button>
                    </div>
                  </Tab>
                  <Tab eventKey="checkInterest" title="Check DBC">
                    <br />
                    Current DBC
                    <br />
                    <div>
                      <button
                        className="btn btn-primary"
                        onClick={() => this.checkDBC()}
                      >
                        GET
                      </button>
                    </div>
                    {this.state.DBC ? this.state.DBC + ' DBC' : ''}
                  </Tab>
                  <Tab
                    eventKey="balanceInnftApp"
                    title="Check Balance In nftApp"
                  >
                    <br />
                    Current Balance in nftApp
                    <br />
                    <div>
                      <button
                        className="btn btn-primary"
                        onClick={() => this.getBalanceInnftApp()}
                      >
                        GET
                      </button>
                    </div>
                    {this.state.balanceInnftApp
                      ? this.state.balanceInnftApp + ' ETH'
                      : ''}
                  </Tab>
                 */}
                </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
