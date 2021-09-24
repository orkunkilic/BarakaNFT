import { Tabs, Tab } from 'react-bootstrap';
import NFTApp from '../abis/NFTApp.json';
import React, { Component } from 'react';
import Token from '../abis/Token.json';
import Web3 from 'web3';
import './App.css';
import { create } from 'ipfs-http-client';

const client = create('https://ipfs.infura.io:5001/api/v0');

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

  async uploadImage(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      this.setState({ fileUrl: url });
    } catch (e) {
      console.log('Upload error: ', e);
    }
  }

  async mint(name, description, amount) {
    if (this.state.nftApp !== 'undefined') {
      try {
        const metadata = {
          name,
          description,
          image: this.state.fileUrl,
        };
        const added = await client.add(Buffer.from(JSON.stringify(metadata)));
        const url = `https://ipfs.infura.io/ipfs/${added.path}`;
        const tokenId = await this.state.nftApp.methods
          .mint(amount.toString(), url)
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
        this.setState({ NFT: null });
        const tokenInfo = await this.state.nftApp.methods
          .getNFTInfo(tokenId)
          .call({ from: this.state.account });
        const response = await fetch(tokenInfo['2']);
        tokenInfo['2'] = await response.json();
        this.setState({ NFT: tokenInfo });
        return tokenInfo;
      } catch (e) {
        console.log('Error, getNFTInfo: ', e);
        this.setState({ NFT: null });
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

  async burn(tokenId) {
    if (this.state.nftApp !== 'undefined') {
      try {
        await this.state.nftApp.methods
          .burnNFT(tokenId)
          .send({ from: this.state.account });
        window.alert('NFT has burned!');
        window.location.reload();
      } catch (e) {
        console.log('Error, burn: ', e);
      }
    }
  }

  async edit(price, tokenId) {
    if (this.state.nftApp !== 'undefined') {
      try {
        await this.state.nftApp.methods
          .editNFTPrice(price.toString(), tokenId)
          .send({ from: this.state.account });
        window.alert('NFT price has edited!');
        window.location.reload();
      } catch (e) {
        console.log('Error, edit: ', e);
      }
    }
  }

  async getTokenIds() {
    if (this.state.nftApp !== 'undefined') {
      try {
        const tokenIds = await this.state.nftApp.methods
          .getTokenIds()
          .call({ from: this.state.account });
        this.setState({ tokenIds });
      } catch (e) {
        console.log('Error, getTokenIds: ', e);
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
      fileUrl: '',
      tokenIds: null,
    };
  }

  render() {
    return (
      <div className="text-monospace">
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <span
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            target="_blank"
            rel="noopener noreferrer"
          >
            <b>BarakaNFT</b>
          </span>
        </nav>
        <div className="container-fluid mt-5 text-center">
          <br></br>
          <h1>Welcome to BarakaNFT</h1>
          <h2>{this.state.account}</h2>
          <div className="d-flex flex-column justify-content-center align-items-center">
            <button
              className="btn btn-primary mb-2"
              onClick={() => this.getTokenIds()}
            >
              GET BNFTs
            </button>
            {this.state.tokenIds
              ? 'You have ' + this.state.tokenIds.length + ' NFT(s)'
              : ''}
            <br />
            {this.state.tokenIds && this.state.tokenIds.length
              ? 'Your NFT id(s) are: ' + this.state.tokenIds
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
                          amount = amount * 10 ** 18;
                          this.mint(
                            this.name.value,
                            this.description.value,
                            amount
                          );
                        }}
                      >
                        <div className="form-group mr-sm-2">
                          <br />
                          <input
                            id="price"
                            step="0.001"
                            type="number"
                            className="form-control form-control-md mb-2"
                            placeholder="Price"
                            required
                            ref={(input) => (this.price = input)}
                          />
                          <input
                            id="name"
                            type="text"
                            className="form-control form-control-md mb-2"
                            placeholder="Name"
                            required
                            ref={(input) => (this.name = input)}
                          />
                          <input
                            id="description"
                            type="text"
                            className="form-control form-control-md mb-2"
                            placeholder="Description"
                            required
                            ref={(input) => (this.description = input)}
                          />
                          <input
                            type="file"
                            name="image"
                            id="image"
                            onChange={(e) => this.uploadImage(e)}
                          />
                          {this.state.fileUrl !== '' ? (
                            <>
                              <img
                                style={{ maxWidth: 300 }}
                                src={this.state.fileUrl}
                                className="img-fluid d-block mb-2 border border-success mt-2"
                                alt="Preview"
                              />
                              <span>(Preview)</span>
                            </>
                          ) : (
                            ''
                          )}
                        </div>
                        {this.state.fileUrl !== '' ? (
                          <button type="submit" className="btn btn-primary">
                            Mint
                          </button>
                        ) : (
                          <span>(Please upload an image & wait...)</span>
                        )}
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
                      </form>
                      {this.state.NFT ? (
                        <div className="d-flex flex-column justify-content-center align-items-center pt-2">
                          <p>Owner: {this.state.NFT['0']}</p>
                          <p>
                            Price:{' '}
                            {this.state.web3.utils.fromWei(this.state.NFT['1'])}{' '}
                            ETH
                          </p>
                          <div className="d-flex flex-column justify-content-center align-items-start border border-success border-5 p-5">
                            <p>Name: {this.state.NFT['2'].name}</p>
                            <p>
                              Description: {this.state.NFT['2'].description}
                            </p>
                            <p>
                              Image:
                              <img
                                style={{ maxWidth: 300 }}
                                src={this.state.NFT['2'].image}
                                alt={this.state.NFT['2'].name}
                                className="img-fluid"
                              />
                            </p>
                          </div>

                          {this.state.NFT['0'] === this.state.account ? (
                            <>
                              <form
                                className="form-inline mt-2"
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  let price = this.price.value * 10 ** 18;
                                  this.edit(price, this.state.NFT['3']);
                                }}
                              >
                                <div className="form-group mr-sm-2">
                                  <br />
                                  <input
                                    id="price"
                                    type="number"
                                    step="0.001"
                                    className="form-control form-control-md"
                                    placeholder="New Price"
                                    required
                                    ref={(input) => (this.price = input)}
                                  />
                                </div>
                                <button
                                  type="submit"
                                  className="btn btn-primary"
                                >
                                  Edit Price
                                </button>
                              </form>
                              <button
                                className="btn btn-danger mt-2"
                                onClick={() => this.burn(this.state.NFT['3'])}
                              >
                                Burn NFT
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn btn-success mt-2 w-50"
                              onClick={() => this.buy(this.state.NFT['3'])}
                            >
                              Buy
                            </button>
                          )}
                        </div>
                      ) : (
                        ''
                      )}
                    </div>
                  </Tab>
                </Tabs>
              </div>
            </main>
          </div>
        </div>
        <footer className="page-footer font-small mt-5">
          <div className="footer-copyright text-center py-3">
            <span className="text-muted">
              Add BNFT to your metamask wallet: {this.state.token?._address} ( 0
              decimal )
            </span>
          </div>
        </footer>
      </div>
    );
  }
}

export default App;
