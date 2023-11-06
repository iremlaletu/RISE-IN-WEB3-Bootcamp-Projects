import { createListingFromPriceID } from "@/util/createListing";
import { getMarketplaceAddress } from "@/util/getContractAddress";
import { getMarketplaceContract, getNFTContract } from "@/util/getContracts";
import {
    Marketplace,
    RequiredParam,
    useCreateDirectListing,
    useGrantRole,
} from "@thirdweb-dev/react";
import { type FC } from "react";

//you can find some explanation at the bottom of the page

interface SellNFTCardProps {
    price: number;
    onUpdatePrice: (newPrice: number) => void;
    id: string;
}

const SellNFTCard: FC<SellNFTCardProps> = ({ price, onUpdatePrice, id }) => {
    const { marketplace } = getMarketplaceContract();
    const { nft_contract } = getNFTContract();

    const { mutate: grantRole, error: roleError } = useGrantRole(nft_contract);

    const {
        mutate: createDirectListing,
        isLoading: listingLoading,
        error: listError,
    } = useCreateDirectListing(marketplace as RequiredParam<Marketplace>);

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onUpdatePrice(Number(event.target.value));
    };
    

    const handleListing = () => {
        try {
            //Grant Role
            grantRole({
                role: "admin",
                address: getMarketplaceAddress(),
            });

            const listing = createListingFromPriceID(price, id);
            //we implemented this function with 2 param. because this func has many param. but we dont want a user to be able to change concract address or the others.
            //

            // List NFT
            createDirectListing(listing);
            // we defined in the types/ the same type thirdweb used to store listings
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <div className="relative bg-gray-800 text-white p-6 rounded-lg w-6/12 shadow-md mt-4">
            <h1 className="text-2xl font-semibold mb-2 ">Sell NFT</h1>

            <div>
                <label className="font-bold text-xl">Price</label>
                <input
                    className=" ml-2 bg-gray-800 w-20"
                    placeholder="Recipient Address"
                    type="number"
                    value={price}
                    onChange={handlePriceChange}
                />
            </div>

            <button
                onClick={handleListing}
                className="mt-4 bg-blue-500 bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                List
            </button>

            {(roleError as unknown as boolean) ||
            (listError as unknown as boolean) ? (
                <div className="text-center mt-4">Error Listing!</div>
            ) : null}
            {listingLoading && (
                <div className="text-center mt-4">Listing in progress...</div>
            )}
        </div>
    );
};
export default SellNFTCard;

//the reason we are getting the nft contract is actually related to the logic of selling.

//market place is another entity from our nft collection, since we are trying to sell our nfts on marketplace when users buy from mp, marketplace needs to transfer on our behalf the nft, so we need to give approval to mp so that mp can hace the authority to transfer the nft

//price => we are getting from ID page
//handle price change => to setting price in the ID page with useState().

//users will give us a number that s/he wants to sell for and we are going to sell this nft the handle listing

//now we are getting the price input from the user we are handling the pricechange and setting the event.target.value as a number to the state of id.tsx

//once the users clicks the list, we are handling the listing starting with granting role to the market place, so that mp can sell on our behalf and  we are just create the listen with the price that we have get from the user