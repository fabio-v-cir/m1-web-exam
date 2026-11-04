import axios from "axios";
import { useState } from "react";
import type {
  BikeModel,
  CreateBikeModel,
  GetBikesModel,
} from "../models/BikeModel";

export const useBikesProvider = () => {
  const [bikes, setBikes] = useState<BikeModel[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const load = () => {
    setIsLoading(true);
    axios
      .get<GetBikesModel>("http://localhost:3000/bikes", {
        params: { page, limit },
      })
      .then((result) => {
        // the last page can become empty after a deletion
        if (result.data.bikes.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }
        setBikes(result.data.bikes);
        setTotalCount(result.data.totalCount);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const changePage = (newPage: number, newLimit: number) => {
    setPage(newPage);
    setLimit(newLimit);
  };

  const createBike = (input: CreateBikeModel) =>
    axios
      .post<BikeModel>("http://localhost:3000/bikes", input)
      .then(() => load());

  // Returns the request so the caller can react to errors (e.g. bike already sold)
  const deleteBike = (id: string) =>
    axios.delete(`http://localhost:3000/bikes/${id}`).then(() => load());

  return {
    bikes,
    totalCount,
    page,
    limit,
    changePage,
    load,
    isLoading,
    createBike,
    deleteBike,
  };
};
